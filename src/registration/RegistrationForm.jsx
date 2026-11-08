import { useState } from 'react'
import { INVITATION, REGISTRATION, SESSION_DATES, SESSIONS, SHOW_SESSION_OWNERS, registrationSlotId } from '../content.js'
import s from './RegistrationForm.module.css'

const TOKEN_KEY = 'foundry-agentic-development-winter-bootcamp:registration-token'

function readRegistrationToken() {
  try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}

function saveRegistrationToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignore */ }
}

function removeRegistrationToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

// "Not you? Start a new registration" forgets this browser's registration token and remounts the
// form, so nothing the previous person entered stays on screen, for example on a shared device.
export default function RegistrationForm() {
  const [generation, setGeneration] = useState(0)
  const startOver = () => {
    removeRegistrationToken()
    setGeneration((current) => current + 1)
  }
  return <RegistrationFields key={generation} onStartOver={startOver} focusOnMount={generation > 0} />
}

function RegistrationFields({ onStartOver, focusOnMount }) {
  const [slots, setSlots] = useState([])
  const [activeDate, setActiveDate] = useState(SESSION_DATES[0].id)
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [emailConfirmation, setEmailConfirmation] = useState('')
  const [registrationToken, setRegistrationToken] = useState(readRegistrationToken)
  const [environment, setEnvironment] = useState('local')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedConfirmation = emailConfirmation.trim().toLowerCase()
  const emailsMatch = Boolean(normalizedEmail) && normalizedEmail === normalizedConfirmation
  const emailMismatch = Boolean(emailConfirmation) && !emailsMatch
  const valid = slots.length > 0 && company.trim() && emailsMatch && consent
  const saved = status === 'received' || status === 'updated'
  const selectedDateCount = new Set(slots.map((slot) => slot.split('|')[0])).size

  const toggleSlot = (id) => setSlots((current) => (
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  ))

  const submit = async (event) => {
    event.preventDefault()
    if (!valid || status === 'submitting') return
    setStatus('submitting')
    setMessage('')
    try {
      let result
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        result = { ok: true, outcome: registrationToken ? 'updated' : 'received', registrationToken: registrationToken || crypto.randomUUID() }
      } else {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: company.trim(),
            email: normalizedEmail,
            emailConfirmation: normalizedConfirmation,
            registrationToken,
            sessions: slots,
            environment,
            consent,
          }),
        })
        result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'Registration could not be saved')
      }
      if (result.registrationToken) {
        saveRegistrationToken(result.registrationToken)
        setRegistrationToken(result.registrationToken)
      }
      // "received" covers both a new registration and an email address that was already registered.
      const updated = result.outcome === 'updated'
      setStatus(updated ? 'updated' : 'received')
      setMessage(updated ? REGISTRATION.updated : REGISTRATION.received)
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.ticketNotice}>
        <span aria-hidden="true">{INVITATION.mark}</span>
        <div>
          <strong>{INVITATION.eyebrow}</strong>
          <p>{INVITATION.description}</p>
        </div>
      </div>

      <div className={s.fields}>
        <label className={s.companyField}>
          <span>Company or organisation</span>
          <input required autoComplete="organization" autoFocus={focusOnMount} value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
        <label>
          <span>Company email address</span>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Re-enter company email address</span>
          <input
            required
            type="email"
            autoComplete="off"
            aria-invalid={emailMismatch}
            value={emailConfirmation}
            onChange={(e) => setEmailConfirmation(e.target.value)}
          />
          {emailConfirmation && <small className={emailsMatch ? s.emailMatch : s.emailMismatch}>{emailsMatch ? 'Email addresses match.' : 'Email addresses do not match.'}</small>}
        </label>
      </div>

      <fieldset className={s.sessionField}>
        <legend>Choose your dates and session times</legend>
        <p className={s.sessionHint}><strong>{REGISTRATION.slotLead}</strong> {REGISTRATION.slotHelp}</p>
        <div className={s.dateTabs} role="tablist" aria-label="Choose a bootcamp date">
          {SESSION_DATES.map((date) => {
            const count = slots.filter((slot) => slot.startsWith(`${date.id}|`)).length
            return (
              <button
                key={date.id}
                type="button"
                role="tab"
                aria-selected={date.id === activeDate}
                className={date.id === activeDate ? s.dateTabOn : ''}
                onClick={() => setActiveDate(date.id)}
              >
                <span>{date.short}</span>
                <small>{count ? `${count} selected` : 'Choose sessions'}</small>
              </button>
            )
          })}
        </div>
        <div className={s.sessionGrid} role="tabpanel">
          {SESSIONS.map((session) => {
            const id = registrationSlotId(activeDate, session)
            const selected = slots.includes(id)
            return (
              <label key={session.id} className={selected ? s.sessionOn : ''}>
                <input type="checkbox" checked={selected} onChange={() => toggleSlot(id)} />
                <time dateTime={session.time}>{session.time}</time>
                <span><strong>{session.number} · {session.title}</strong>{SHOW_SESSION_OWNERS && <small>Owner · {session.owner}</small>}</span>
                <i aria-hidden="true">{selected ? '✓' : '+'}</i>
              </label>
            )
          })}
        </div>
        <p className={s.selectionSummary}>
          {slots.length
            ? `${slots.length} session time${slots.length === 1 ? '' : 's'} selected across ${selectedDateCount} date${selectedDateCount === 1 ? '' : 's'}`
            : 'No date or session time selected yet'}
        </p>
      </fieldset>

      <fieldset className={s.environment}>
        <legend>Development environment</legend>
        {REGISTRATION.environments.map((option) => (
          <label key={option.id}>
            <input type="radio" name="environment" value={option.id} checked={environment === option.id} onChange={(e) => setEnvironment(e.target.value)} />
            <span><strong>{option.label}</strong><small>{option.desc}</small></span>
          </label>
        ))}
      </fieldset>

      <label className={s.consent}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{REGISTRATION.consent}</span>
      </label>

      <div className={s.submitRow}>
        <button type="submit" disabled={!valid || status === 'submitting' || saved}>
          {status === 'submitting' ? 'Saving…' : status === 'updated' ? 'Updated ✓' : status === 'received' ? 'Received ✓' : 'Submit registration'}
        </button>
        <small>No sign-in is required. Your formal invitation is sent to your confirmed company email.</small>
      </div>
      {message && <p className={`${s.message} ${status === 'error' ? s.error : ''}`} role="status">{message}</p>}
      {registrationToken && (
        <button type="button" className={s.startOver} disabled={status === 'submitting'} onClick={onStartOver}>
          {REGISTRATION.startOver}
        </button>
      )}
    </form>
  )
}
