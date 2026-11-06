import { InlineEditProvider, Navigation, SlideErrorBoundary, SlideProvider, useSlides } from '@deckio/deck-engine'
import '@deckio/deck-engine/styles/editable.css'
import project from '../deck.config.js'
import { useRef, useState } from 'react'
import { ChristmasLights, Mascot } from './winter/Decor.jsx'
import { TeamSlide } from './slides/WinterSlides.jsx'

function FloatingCopilot() {
  const { current, totalSlides } = useSlides()
  if (current <= 0 || current === totalSlides - 1) return null
  // On laptop-sized screens the mascot would cover the text of the last team card.
  if (project.slides[current] === TeamSlide) return null
  return <Mascot className="floating-copilot" />
}

const LIGHTS = 34

// One persistent light string for the whole deck, so it fills up instead of fading with each slide.
function DeckLights() {
  const { current, totalSlides, visibleIndices = [] } = useSlides()
  const order = visibleIndices.length ? visibleIndices : Array.from({ length: totalSlides }, (_, i) => i)
  const pos = Math.max(0, order.indexOf(current))
  const lit = Math.round(((pos + 1) / order.length) * LIGHTS)
  const prev = useRef({ pos, lit, from: 0 })
  if (prev.current.pos !== pos) {
    prev.current = { pos, lit, from: Math.min(prev.current.lit, lit) }
  }
  return (
    <ChristmasLights
      count={LIGHTS}
      className="deck-lights"
      lit={lit}
      prevLit={prev.current.from}
      complete={pos === order.length - 1}
    />
  )
}

const NAVBAR_DISMISSED_KEY = 'deck-navbar-dismissed'

function readNavbarDismissed() {
  try { return localStorage.getItem(NAVBAR_DISMISSED_KEY) === '1' } catch { return false }
}

function DeckNavBar() {
  const { go, atStart, atEnd, displayIndex, visibleCount } = useSlides()
  const [dismissed, setDismissed] = useState(readNavbarDismissed)
  if (dismissed) return null
  const dismiss = () => {
    try { localStorage.setItem(NAVBAR_DISMISSED_KEY, '1') } catch { /* storage unavailable */ }
    setDismissed(true)
  }
  // Pointer clicks blur the button so the engine's arrow-key handler (which ignores focused buttons) keeps working.
  const step = (e, dir) => {
    go(dir)
    if (e.detail > 0) e.currentTarget.blur()
  }
  return (
    <nav className="deck-navbar" aria-label="Slide navigation">
      <button type="button" className="deck-navbar-btn" onClick={(e) => step(e, -1)} disabled={atStart} aria-label="Previous slide">
        <span aria-hidden="true">←</span><span className="deck-navbar-label">Previous</span>
      </button>
      <div className="deck-navbar-status">
        <span className="deck-navbar-count" aria-live="polite">Slide {displayIndex + 1} of {visibleCount}</span>
        <span className="deck-navbar-hint deck-navbar-hint-keys">Use the buttons or arrow keys</span>
        <span className="deck-navbar-hint deck-navbar-hint-touch">Tap Next or swipe left</span>
      </div>
      <button type="button" className="deck-navbar-btn deck-navbar-next" onClick={(e) => step(e, 1)} disabled={atEnd} aria-label="Next slide">
        <span className="deck-navbar-label">Next</span><span aria-hidden="true">→</span>
      </button>
      <button type="button" className="deck-navbar-close" onClick={dismiss} aria-label="Hide slide navigation" title="Hide (swipe and arrow keys still work)">
        <span aria-hidden="true">×</span>
      </button>
    </nav>
  )
}

export default function DeckView() {
  const { id, slides, theme } = project
  return (
    <InlineEditProvider overrides={{}} project={id}>
      <SlideProvider totalSlides={slides.length} project={id} slides={slides} theme={theme}>
        <div className="deck-chrome">
          <a className="deck-home-link" href="#/">← Website</a>
        </div>
        <Navigation />
        <DeckLights />
        <div className="deck" data-project-id={id}>
          {slides.map((SlideComponent, index) => (
            <SlideErrorBoundary key={`${id}-slide-${index}`} index={index}>
              <SlideComponent index={index} project={project} />
            </SlideErrorBoundary>
          ))}
        </div>
        <FloatingCopilot />
        <DeckNavBar />
      </SlideProvider>
    </InlineEditProvider>
  )
}
