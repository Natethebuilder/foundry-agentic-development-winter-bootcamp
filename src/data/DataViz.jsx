import { useEffect, useState } from 'react'
import { AGENT_RUNS, DATES_NOTE, REGISTRATION_FORM, SESSION_DATES, SESSIONS, SHOW_SESSION_OWNERS } from '../content.js'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js'
import { REGISTRATION_OPEN, REGISTRATION_OPENS_SOON, REGISTRATION_VIA_FORM } from '../siteState.js'
import d from './Data.module.css'

/* ── Countdown to the first session, styled as the agent's next scheduled run ── */
export function Countdown({ target, date, dateLabel, preliminary = false, className = '' }) {
  const t = target ? new Date(target).getTime() : null
  const dateOnly = !t && date ? new Date(`${date}T12:00:00`) : null
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!t) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [t])

  const diff = t == null ? null : Math.max(0, t - now)
  const parts = diff != null
    ? [
        Math.floor(diff / 86400000),
        Math.floor(diff / 3600000) % 24,
        Math.floor(diff / 60000) % 60,
        Math.floor(diff / 1000) % 60,
      ].map((n) => String(n).padStart(2, '0'))
    : dateOnly
      ? [
          String(dateOnly.getDate()).padStart(2, '0'),
          dateOnly.toLocaleString('en', { month: 'short' }).toUpperCase(),
          String(dateOnly.getFullYear()),
          dateOnly.toLocaleString('en', { weekday: 'short' }).toUpperCase(),
        ]
      : ['--', '--', '--', '--']
  const labels = dateOnly ? ['day', 'month', 'year', 'starts'] : ['days', 'hrs', 'min', 'sec']
  const dateStatus = preliminary ? 'preliminary dates' : 'dates confirmed'
  const status = t == null ? (dateOnly ? dateStatus : 'awaiting schedule') : diff > 0 ? 'scheduled' : 'live now'
  const statusClass = t == null
    ? (dateOnly && !preliminary ? d.statusOk : d.statusWait)
    : diff > 0 ? d.statusOk : d.statusLive

  return (
    <div className={`${d.countdown} ${className}`} role={t ? 'timer' : 'group'} aria-live="off">
      <div className={d.cdHead}>
        <span className={d.mono}>▸ next run · session_01</span>
        <span className={`${d.status} ${statusClass}`}><i />{status}</span>
      </div>
      <div className={d.cdDigits}>
        {labels.map((label, i) => (
          <div key={label} className={d.cdCell}>
            <span className={`${d.cdNum} ${t == null && !dateOnly ? d.cdPending : ''}`}>{parts[i]}</span>
            <span className={d.cdLabel}>{label}</span>
          </div>
        ))}
      </div>
      {(t != null || dateLabel) && (
        <p className={d.cdFoot}>
          First session: {t != null ? new Date(t).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : dateLabel}
        </p>
      )}
    </div>
  )
}

/* ── Microsoft Foundry console: one example agent at each lifecycle stage, as trace spans ── */
const OP_TONE = { chat: 'model', execute_tool: 'tool', retrieval: 'tool', evaluator: 'eval', compare: 'eval' }

export function AgentRunConsole({ className = '', children }) {
  const reduced = usePrefersReducedMotion()
  const [runIndex, setRunIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [shown, setShown] = useState(0)
  const run = AGENT_RUNS[runIndex]
  const stageIndex = Math.max(0, SESSIONS.findIndex((session) => session.id === run.session))
  const stage = SESSIONS[stageIndex]
  const steps = run.spans.length + 1

  useEffect(() => {
    const next = () => {
      setChars(0)
      setShown(0)
      setRunIndex((current) => (current + 1) % AGENT_RUNS.length)
    }
    let id
    if (reduced) id = setTimeout(next, 7000)
    else if (chars < run.input.length) id = setTimeout(() => setChars((c) => c + 1), 22)
    else if (shown < steps) id = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 550 : 460)
    else id = setTimeout(next, 3800)
    return () => clearTimeout(id)
  }, [reduced, chars, shown, steps, run.input.length, runIndex])

  // Reduced motion shows each run complete instead of typing it out.
  const typed = reduced ? run.input.length : chars
  const visible = reduced ? steps : shown
  const typing = typed < run.input.length
  const complete = visible >= steps
  const spans = run.spans.slice(0, Math.min(visible, run.spans.length))

  return (
    <div className={`${d.console} ${className}`} style={{ '--stage-accent': stage.accent }}>
      {children}
      <div className={d.consoleBar}>
        <span className={d.dots}><i /><i /><i /></span>
        <span className={d.consoleTitle}><span className={d.brandWord}>Microsoft </span>Foundry <b>›</b> {run.area}</span>
        <span className={`${d.runState} ${complete ? d.runDone : ''}`}><i />{complete ? 'completed' : 'running'}</span>
      </div>
      <div className={d.stageStrip} aria-hidden="true">
        <span className={d.stageName}>Stage {stage.number}/{String(SESSIONS.length).padStart(2, '0')} · {stage.track}</span>
        <span className={d.stageBars}>
          {SESSIONS.map((session, i) => (
            <i
              key={session.id}
              className={i < stageIndex ? d.stagePast : i === stageIndex ? d.stageNow : ''}
              style={{ '--bar': session.accent }}
            />
          ))}
        </span>
      </div>
      <div
        className={d.consoleBody}
        role="img"
        aria-label="Animated example: an agent at each stage of its lifecycle in Microsoft Foundry"
      >
        <p className={d.consoleInput}>
          <span className={d.actor}>{run.actor} ›</span> {run.input.slice(0, typed)}
          {typing && <span className={d.caret} />}
        </p>
        <ol className={d.trace}>
          {spans.map((span, i) => (
            <li
              key={`${runIndex}-${i}`}
              className={i === 0 ? d.spanRoot : d.spanChild}
              data-tone={i === 0 ? 'root' : OP_TONE[span.op] ?? 'step'}
            >
              {i > 0 && <span className={d.branch}>{i === run.spans.length - 1 ? '└' : '├'}</span>}
              <span className={d.op}>{span.op}</span>
              <span className={d.spanName}>{span.name}</span>
              <span className={d.spanMeta}>{span.meta}</span>
            </li>
          ))}
          {!typing && visible < run.spans.length && (
            <li className={d.spanPending}>
              <span className={d.spinner} />
              {visible === 0 ? 'starting run…' : 'running…'}
            </li>
          )}
        </ol>
        {complete && <p className={d.consoleResult}><span>✓</span>{run.result}</p>}
      </div>
    </div>
  )
}

/* ── Six repeated event dates and the shared full-day agenda ── */
export function ScheduleBoard() {
  return (
    <div className={d.scheduleBoard}>
      <div className={d.dateRail} aria-label="Bootcamp dates">
        {SESSION_DATES.map((date) => (
          <article key={date.id} className={d.dateCard}>
            <span>{date.month}</span>
            <strong>{date.day}</strong>
            <small>Full programme</small>
          </article>
        ))}
      </div>
      <div className={d.agenda}>
        <div className={d.agendaHead}>
          <div>
            <span>Every event date</span>
            <strong>Six-session daily agenda</strong>
          </div>
          <p>
            {[
              REGISTRATION_VIA_FORM
                ? REGISTRATION_FORM.agendaNote
                : REGISTRATION_OPEN && 'Select any combination of dates and session times during registration.',
              REGISTRATION_OPENS_SOON && 'Once registration opens, you can select any combination of dates and session times.',
              DATES_NOTE,
            ].filter(Boolean).join(' ')}
          </p>
        </div>
        <div className={d.agendaGrid}>
          {SESSIONS.map((session) => (
            <article key={session.id} className={d.agendaSlot} style={{ '--slot-accent': session.accent }}>
              <time dateTime={session.time}>{session.time}</time>
              <div>
                <span>{session.number} · {session.track}</span>
                <strong>{session.shortTitle}</strong>
                {SHOW_SESSION_OWNERS && <small>Owner · {session.owner}</small>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
