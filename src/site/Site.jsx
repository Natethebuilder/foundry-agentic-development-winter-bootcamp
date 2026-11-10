import { useEffect, useRef, useState } from 'react'
import { FoundryMark, Logos, Mascot } from '../winter/Decor.jsx'
import { AgentRunConsole, Countdown, ScheduleBoard } from '../data/DataViz.jsx'
import PillarMark from '../agentic/PillarMark.jsx'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'
import SetupWizard from '../setup/SetupWizard.jsx'
import RegistrationForm from '../registration/RegistrationForm.jsx'
import MicrosoftFormRegistration from '../registration/MicrosoftFormRegistration.jsx'
import SpeakerAvatar from '../speakers/SpeakerAvatar.jsx'
import {
  BOOTCAMP, DATES_NOTE, FAQ, LINEUP, MICROHACK_ACCESS, PERSONAS, PILLARS, PREP, PREREQUISITES, REGISTRATION,
  REGISTRATION_FORM, REGISTRATION_NOTICE, SESSIONS, SHOW_SESSION_OWNERS, sessionOwner,
} from '../content.js'
import { PREREQUISITES_STATE, REGISTRATION_OPEN, REGISTRATION_OPENS_SOON, REGISTRATION_VIA_FORM } from '../siteState.js'
import s from './Site.module.css'

const NAV = [
  ['why', 'Why join'],
  ['lineup', 'Lineup'],
  ['schedule', 'Schedule'],
  ['prepare', 'Get ready'],
  ['join', 'Register'],
  ['faq', 'FAQ'],
]

const PREP_KEY = 'foundry-agentic-development-winter-bootcamp:prep'
const DECK_URL = `${import.meta.env.BASE_URL}#/deck`

function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const els = root.querySelectorAll(`.${s.reveal}`)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(s.in)),
      { root, threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))

    // Items pop in as they scroll into view; long single-column phone sections otherwise feel static
    const items = root.querySelectorAll(`.${s.grid} > *, .${s.checkItem}, .${s.faqItem}, .${s.personaBox}, .${s.flow}`)
    const itemIo = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, k) => {
        e.target.style.setProperty('--i', k)
        e.target.classList.add(s.popIn)
        itemIo.unobserve(e.target)
      })
    }, { root, threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    items.forEach((el) => { el.classList.add(s.pop); itemIo.observe(el) })

    return () => { io.disconnect(); itemIo.disconnect() }
  }, [rootRef])
}

// Each section is a self-contained, full-height panel so it reads on its own.
function Section({ id, idx, eyebrow, title, subtitle, className = '', children }) {
  return (
    <section id={id} className={`${s.panel} ${className}`} data-panel>
      <div className={`${s.section} ${s.reveal}`}>
        <div className={s.sectionHead}>
          <p className={s.eyebrow}><span className={s.eyebrowIdx}>{idx}</span>{eyebrow}</p>
          <h2>{title}</h2>
          {subtitle && <p className={s.lead}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

function useActiveSection(rootRef) {
  const [active, setActive] = useState('top')
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { root, rootMargin: '-45% 0px -50% 0px' },
    )
    root.querySelectorAll('[data-panel]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
  return active
}

function PersonaPicker() {
  const [sel, setSel] = useState(PERSONAS[0].id)
  const p = PERSONAS.find((x) => x.id === sel)
  return (
    <div className={s.personaBox}>
      <div className={s.personaTabs} role="tablist" aria-label="Pick your role">
        <span className={s.personasLabel}>Made for</span>
        {PERSONAS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === sel}
            className={`${s.persona} ${x.id === sel ? s.personaOn : ''}`}
            onClick={() => setSel(x.id)}
          >
            {x.icon} {x.label}
          </button>
        ))}
      </div>
      <div className={s.personaPanel} role="tabpanel" key={sel}>
        <p>{p.does}</p>
        <div className={s.stack}>
          <span className={s.stackLabel}>your stack</span>
          {p.stack.map((t) => <span key={t} className={s.stackChip}>{t}</span>)}
        </div>
      </div>
    </div>
  )
}

// The programme agent hands off to one session per lifecycle stage, then reveals the session list.
const BUS_GRADIENT = `linear-gradient(90deg, ${SESSIONS.map((session) => session.accent).join(', ')})`

function ProgrammeReveal() {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState('idle')
  const [lit, setLit] = useState(0)
  const runRef = useRef(null)
  const firstNodeRef = useRef(null)
  const moveFocus = useRef(false)

  useEffect(() => {
    if (phase !== 'running') return undefined
    const id = lit < SESSIONS.length
      ? setTimeout(() => setLit((n) => n + 1), lit === 0 ? 560 : 260)
      : setTimeout(() => setPhase('done'), 450)
    return () => clearTimeout(id)
  }, [phase, lit])

  // The run button disappears when the handoffs finish, so keep keyboard focus on the first stage.
  useEffect(() => {
    if (phase === 'done' && moveFocus.current) {
      moveFocus.current = false
      firstNodeRef.current?.focus({ preventScroll: true })
    }
  }, [phase])

  const run = () => {
    if (phase !== 'idle') return
    moveFocus.current = document.activeElement === runRef.current
    if (reduced) {
      setLit(SESSIONS.length)
      setPhase('done')
    } else {
      setPhase('running')
    }
  }

  const jumpTo = (id) =>
    document.getElementById(`session-${id}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })

  const status = phase === 'idle' ? 'ready' : phase === 'running' ? `handoff ${lit}/${SESSIONS.length}` : 'complete'

  return (
    <div className={s.programmeReveal}>
      <div className={`${s.orch} ${phase !== 'idle' ? s.orchActive : ''} ${phase === 'done' ? s.orchDone : ''}`}>
        <div className={s.orchHead}>
          <span className={s.orchName}><i aria-hidden="true" />{LINEUP.agent}</span>
          <span className={s.orchStatus}><i aria-hidden="true" />{status}</span>
        </div>

        <div className={s.orchCore}>
          <span className={s.orchCoreMark}><FoundryMark /></span>
          <span className={s.orchCoreText}>
            <strong>{LINEUP.coreTitle}</strong>
            <small>{LINEUP.coreDetail}</small>
          </span>
        </div>
        <span className={s.orchTrunk} aria-hidden="true" />
        <span className={s.orchBus} style={{ '--bus': BUS_GRADIENT }} aria-hidden="true" />

        <ol className={s.orchNodes} aria-label="Programme stages">
          {SESSIONS.map((session, index) => {
            const label = (
              <>
                <span className={s.orchNodeNum}>{session.number}</span>
                <span className={s.orchNodeTrack}>{session.track}</span>
                <span className={s.orchNodeTime}>{session.time}</span>
              </>
            )
            return (
              <li
                key={session.id}
                className={index < lit ? s.orchNodeOn : ''}
                style={{ '--node-accent': session.accent, '--i': index }}
              >
                <i className={s.orchPacket} aria-hidden="true" />
                {phase === 'done' ? (
                  <button
                    type="button"
                    ref={index === 0 ? firstNodeRef : undefined}
                    className={s.orchNode}
                    onClick={() => jumpTo(session.id)}
                    aria-label={`Go to session ${session.number}: ${session.title}`}
                  >
                    {label}
                  </button>
                ) : (
                  <span className={s.orchNode}>{label}</span>
                )}
              </li>
            )
          })}
        </ol>

        {phase === 'done' ? (
          <p className={s.orchHint}>{LINEUP.done}</p>
        ) : (
          <button
            ref={runRef}
            type="button"
            className={`${s.btnPrimary} ${s.orchRun}`}
            onClick={run}
            aria-disabled={phase === 'running'}
            aria-controls="programme-sessions"
            aria-expanded="false"
          >
            <span className={phase === 'running' ? s.orchSpinner : s.orchPlay} aria-hidden="true" />
            {phase === 'running' ? LINEUP.running : LINEUP.run}
          </button>
        )}
        <span className={s.srOnly} role="status">{phase === 'done' ? LINEUP.done : ''}</span>
      </div>

      {phase === 'done' && (
        <div id="programme-sessions" className={s.sessionList}>
          {SESSIONS.map((session, index) => (
            <article
              key={session.id}
              id={`session-${session.id}`}
              className={`${s.sessionRow} ${s.sessionRowOpen}`}
              style={{ '--i': index, '--session-accent': session.accent }}
            >
              <div className={s.sessionSummary}>
                <span className={s.sessionNumber}>{session.number}</span>
                <span className={s.sessionHeading}>
                  <span className={s.sessionAudience}>{session.time} · {session.audience}</span>
                  <strong>{session.title}</strong>
                  <small>{session.subtitle}</small>
                </span>
                {SHOW_SESSION_OWNERS && (
                  <span className={s.sessionLead}>
                    <SpeakerAvatar person={sessionOwner(session)} className={s.sessionHeadshot} />
                    <span className={s.sessionLeadCopy}>
                      <small>Session owner</small>
                      <strong>{session.owner}</strong>
                    </span>
                  </span>
                )}
              </div>

              <div className={s.sessionDetails}>
                <p className={s.sessionSpotlight}>{session.spotlight}</p>
                <p className={s.sessionOverview}>{session.overview}</p>

                <div className={s.sessionDepth}>
                  <div>
                    <h4>You will</h4>
                    <ul>
                      {session.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                    </ul>
                  </div>
                  <div className={s.sessionToolkit}>
                    <span>Tools and concepts</span>
                    <div className={s.sessionTools}>
                      {session.tools.map((tool) => <span key={tool}>{tool}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function PrepChecklist() {
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PREP_KEY)) || {} } catch { return {} }
  })
  useEffect(() => {
    try { localStorage.setItem(PREP_KEY, JSON.stringify(done)) } catch { /* ignore */ }
  }, [done])

  const count = PREP.filter((p) => done[p.id]).length
  const pct = Math.round((count / PREP.length) * 100)
  const all = count === PREP.length

  return (
    <div className={s.checklist}>
      <div className={s.checkHead}>
        <div>
          <span className={s.checkScore}>{count}/{PREP.length}</span>
          <span className={s.checkLabel}>{all ? 'All checks passed. You are ready.' : 'checks passed'}</span>
        </div>
        <div className={s.progress} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul>
        {PREP.map((p) => (
          <li key={p.id}>
            <label className={`${s.checkItem} ${done[p.id] ? s.checked : ''}`}>
              <input
                type="checkbox"
                checked={Boolean(done[p.id])}
                onChange={(e) => setDone((d) => ({ ...d, [p.id]: e.target.checked }))}
              />
              <span className={s.checkBox} aria-hidden="true">{done[p.id] ? '✓' : ''}</span>
              <span className={s.checkIcon} aria-hidden="true">{p.icon}</span>
              <span className={s.checkText}>
                <strong>{p.title}</strong>
                <small>{p.desc}</small>
              </span>
              <span className={`${s.badge} ${done[p.id] ? s.badgePass : ''}`}>{done[p.id] ? 'PASS' : 'PENDING'}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Stands in for a section's interactive content while that part of the programme is not open yet,
// or no longer open. The pulsing dot marks something that is still to come.
function SoonPanel({ mark, label, heading, body, pulse = true, children }) {
  return (
    <div className={s.soonPanel} role="status">
      <span className={s.soonMark} aria-hidden="true">{mark}</span>
      <div>
        <small>{pulse && <i aria-hidden="true" />}{label}</small>
        <h3>{heading}</h3>
        <p>{body}</p>
      </div>
      {children && <div className={s.soonActions}>{children}</div>}
    </div>
  )
}

export default function Site() {
  const rootRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  useReveal(rootRef)
  const active = useActiveSection(rootRef)

  const go = (id) => rootRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('register') === '1') {
      const id = setTimeout(() => go('join'), 100)
      return () => clearTimeout(id)
    }
    return undefined
  }, [])

  return (
    <div className={s.site} ref={rootRef} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}>

      <header className={`${s.nav} ${scrolled ? s.navScrolled : ''}`}>
        <button type="button" className={s.brand} onClick={() => go('top')}>
          <span className={s.brandMark}>
            <FoundryMark className={s.brandLogo} />
          </span>
          <span className={s.brandText}><small>Foundry Agentic Development</small><strong>Winter Bootcamp</strong></span>
        </button>
        <nav className={s.navLinks} aria-label="Sections">
          {NAV.map(([id, label]) => (
            <button key={id} type="button" className={active === id ? s.navActive : ''} aria-current={active === id ? 'true' : undefined} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
        <div className={s.navActions}>
          <a className={`${s.btnGhost} ${s.navDeck}`} href={DECK_URL} aria-label="Open slide deck"><span className={s.navDeckIcon} aria-hidden="true">▶ </span>Slide deck</a>
        </div>
      </header>

      <main>
        <section id="top" className={`${s.panel} ${s.heroPanel}`} data-panel>
          <div className={s.hero}>
          <div className={s.heroText}>
            <span className={s.pill}>{BOOTCAMP.season} · Online · Free · Six one-hour sessions</span>
            <h1>
              Foundry Agentic Development <span className={s.highlight}>Winter Bootcamp</span>
            </h1>
            <p className={s.heroLead}>
              <strong>{BOOTCAMP.tagline}</strong> {BOOTCAMP.subtitle}
            </p>
            <div className={s.ctaRow}>
              <button type="button" className={s.btnGhost} onClick={() => go('why')}>More info</button>
              <button type="button" className={s.btnGhost} onClick={() => go('lineup')}>See the lineup</button>
              <button type="button" className={s.btnPrimary} onClick={() => go('join')}>
                {REGISTRATION_OPEN ? 'Register now' : REGISTRATION_NOTICE.cta}
              </button>
            </div>
            <Countdown
              target={BOOTCAMP.kickoff}
              date={BOOTCAMP.kickoffDate}
              dateLabel={BOOTCAMP.kickoffLabel}
              preliminary={!BOOTCAMP.datesConfirmed}
              className={s.countdown}
            />
          </div>
          <div className={s.heroArt}>
            <AgentRunConsole className={s.heroConsole}>
              <Mascot className={s.perched} />
            </AgentRunConsole>
            <Logos size="md" className={s.heroLogos} />
          </div>
          </div>
          <button type="button" className={s.scrollCue} onClick={() => go('why')} aria-label="Next section">
            <span>scroll</span><i aria-hidden="true">↓</i>
          </button>
        </section>

        <Section
          id="why"
          idx="01"
          eyebrow="Why join"
          title="From a working agent to an operable, governed application."
          subtitle="A hands-on programme for AI application developers, solution and cloud architects, platform and AI engineers, and technical product teams."
        >
          <div className={`${s.grid} ${s.g3}`}>
            {PILLARS.map((p) => (
              <article key={p.id} className={s.card}>
                <PillarMark id={p.id} tag={p.tag} />
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </article>
            ))}
          </div>
          <PersonaPicker />
        </Section>


        <Section
          id="lineup"
          idx="02"
          eyebrow="The lineup"
          title={LINEUP.title}
          subtitle={LINEUP.subtitle}
          className={s.lineupPanel}
        >
          <ProgrammeReveal />
        </Section>

        <Section
          id="schedule"
          idx="03"
          eyebrow="Schedule"
          title="Six dates. The same complete programme."
          subtitle={[
            'All six sessions run on every date.',
            REGISTRATION_OPEN && 'When you register, pick as many sessions as you like, on as many dates as you like.',
            REGISTRATION_OPENS_SOON && 'Once registration opens, pick as many sessions as you like, on as many dates as you like.',
            DATES_NOTE,
          ].filter(Boolean).join(' ')}
        >
          <ScheduleBoard />
        </Section>

        <Section
          id="prepare"
          idx="04"
          eyebrow="Get ready"
          title={PREREQUISITES[PREREQUISITES_STATE].title}
          subtitle={PREREQUISITES[PREREQUISITES_STATE].subtitle}
          className={s.preflightPanel}
        >
          {PREREQUISITES_STATE === 'microhack' ? (
            <div className={s.setupStack}>
              <div className={s.readinessPaths}>
                {MICROHACK_ACCESS.map((path, index) => (
                  <article key={path.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{path.title}</strong>
                      <p>{path.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className={s.preflightBlock}>
                <div className={s.preflightLabel}><span>01</span><strong>Readiness checklist</strong></div>
                <PrepChecklist />
              </div>
              <div className={s.preflightBlock}>
                <div className={s.preflightLabel}><span>02</span><strong>Guided setup</strong></div>
                <SetupWizard />
              </div>
            </div>
          ) : (
            <SoonPanel
              mark={PREREQUISITES.soon.mark}
              label={PREREQUISITES.soon.label}
              heading={PREREQUISITES.soon.heading}
              body={PREREQUISITES.soon.body}
            />
          )}
        </Section>

        <Section
          id="join"
          idx="05"
          eyebrow={REGISTRATION_OPEN ? REGISTRATION.eyebrow : REGISTRATION_NOTICE.eyebrow}
          title={REGISTRATION_OPEN ? REGISTRATION.title : REGISTRATION_NOTICE.title}
          subtitle={REGISTRATION_VIA_FORM ? REGISTRATION_FORM.subtitle : REGISTRATION_OPEN ? REGISTRATION.subtitle : REGISTRATION_NOTICE.subtitle}
        >
          {REGISTRATION_VIA_FORM ? <MicrosoftFormRegistration /> : REGISTRATION_OPEN ? <RegistrationForm /> : (
            <SoonPanel
              mark={REGISTRATION_NOTICE.mark}
              label={REGISTRATION_NOTICE.badge}
              heading={REGISTRATION_NOTICE.heading}
              body={REGISTRATION_NOTICE.body}
              pulse={REGISTRATION_OPENS_SOON}
            >
              <button type="button" className={s.btnGhost} onClick={() => go('lineup')}>See the lineup</button>
              <button type="button" className={s.btnGhost} onClick={() => go('schedule')}>View the schedule</button>
            </SoonPanel>
          )}
        </Section>

        <Section id="faq" idx="06" eyebrow="FAQ" title="Frequently asked questions">
          <div className={s.faq}>
            {FAQ.map((f) => (
              <details key={f.q} className={s.faqItem}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <footer className={s.footer}>
          <Logos size="sm" />
          <p>
            Educational workshop series delivered by Microsoft. Not a consulting engagement. Use sample or
            non-sensitive data, code and repositories only. Workshop outputs are learning artifacts.
          </p>
          <p className={s.footerSmall}>Built with DECKIO</p>
        </footer>
      </main>
    </div>
  )
}
