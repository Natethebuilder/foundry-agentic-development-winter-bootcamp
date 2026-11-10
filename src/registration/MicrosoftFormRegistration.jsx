import { useEffect, useRef, useState } from 'react'
import { REGISTRATION_FORM } from '../content.js'
import { REGISTRATION_FORM_EMBED_URL, REGISTRATION_FORM_URL } from '../siteState.js'
import s from './MicrosoftFormRegistration.module.css'

// Registration state 4: registrations go to this bootcamp's Microsoft Form, embedded on the page.

function FormFrame({ frameRef, className }) {
  return (
    <iframe
      ref={frameRef}
      className={className}
      src={REGISTRATION_FORM_EMBED_URL}
      title={REGISTRATION_FORM.frameTitle}
      allowFullScreen
    />
  )
}

function NewTabRow({ note }) {
  return (
    <div className={s.newTabRow}>
      <a className={s.newTab} href={REGISTRATION_FORM_URL} target="_blank" rel="noopener noreferrer">
        {REGISTRATION_FORM.newTab} <span aria-hidden="true">↗</span>
      </a>
      <small>{note}</small>
    </div>
  )
}

// The landing site's register section. Nothing loads from Microsoft Forms until the visitor starts.
export default function MicrosoftFormRegistration() {
  const [started, setStarted] = useState(false)
  const frameRef = useRef(null)

  useEffect(() => {
    if (started) frameRef.current?.focus()
  }, [started])

  return (
    <div className={`${s.card} ${started ? s.cardStarted : ''}`}>
      {started ? <FormFrame frameRef={frameRef} className={s.frame} /> : (
        <div className={s.intro}>
          <span className={s.mark} aria-hidden="true">{REGISTRATION_FORM.mark}</span>
          <div>
            <small className={s.badge}><i aria-hidden="true" />{REGISTRATION_FORM.badge}</small>
            <h3>{REGISTRATION_FORM.heading}</h3>
            <p>{REGISTRATION_FORM.body}</p>
          </div>
          <ul className={s.needs}>
            {REGISTRATION_FORM.needs.map((need) => <li key={need}>{need}</li>)}
          </ul>
          <button type="button" className={s.start} onClick={() => setStarted(true)}>
            {REGISTRATION_FORM.start} <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
      <NewTabRow note={started ? REGISTRATION_FORM.provider : REGISTRATION_FORM.providerBeforeStart} />
    </div>
  )
}

// The deck's registration dialog. Opening the dialog is already the visitor's choice, so the form loads at once.
export function MicrosoftFormDialogBody() {
  return (
    <div className={s.dialogBody}>
      <FormFrame className={`${s.frame} ${s.dialogFrame}`} />
      <NewTabRow note={REGISTRATION_FORM.provider} />
    </div>
  )
}
