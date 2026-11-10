const { createHash, randomUUID } = require('node:crypto')
const siteState = require('../site-state.json')
const CONSENT = require('../consent.json')

const EVENT_ID = 'foundry-agentic-development-winter-bootcamp'
const SESSION_DATES = ['2026-12-04', '2026-12-11', '2026-12-18', '2027-01-08', '2027-01-15', '2027-01-22']
const SESSION_TIMES = {
  foundations: '09:00',
  'advanced-patterns': '10:00',
  evaluate: '11:00',
  deploy: '12:30',
  operate: '13:30',
  govern: '14:30',
}
const SESSION_SELECTIONS = new Set(SESSION_DATES.flatMap((date) => (
  Object.entries(SESSION_TIMES).map(([sessionId, time]) => `${date}|${time}|${sessionId}`)
)))
const ENVIRONMENTS = new Set(['local', 'cloud'])
const REGISTRATION_TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// Power Automate can take several seconds just to accept a request, so wait well beyond its
// usual 1-3 s while staying under the 45 s Static Web Apps API request limit.
const FLOW_TIMEOUT_MS = 30_000
const EMAIL_MISMATCH = 'This email address doesn’t match the registration saved in this browser. Check the address, or choose "Not you? Start a new registration".'

function response(status, body) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body,
  }
}

// Only state 1 in api/site-state.json accepts registrations. State 2 (opening soon), state 3
// (closed), state 4 (registration through the bootcamp's Microsoft Form) and any unknown value
// refuse them without calling the flow. State 4 tells visitors with a cached page where to go.
function registrationRefusal(state) {
  if (state === 1) return null
  if (state === 2) return 'Registration will open soon.'
  if (state === 3) return 'Registration is closed.'
  if (state === 4) return 'Registration has moved to a new form. Refresh this page to register.'
  return 'Registration is not open.'
}

// The flow answers with JSON such as {"ok":true,"outcome":"created"}. A body that cannot be read
// has no outcome.
async function readFlowResult(flowResponse) {
  try {
    const result = JSON.parse(await flowResponse.text())
    return result && typeof result === 'object' ? result : {}
  } catch {
    return {}
  }
}

module.exports = async function register(context, req) {
  const refusal = registrationRefusal(siteState.registration)
  if (refusal) {
    context.res = response(403, { error: refusal })
    return
  }

  const body = req.body || {}
  const company = typeof body.company === 'string' ? body.company.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const emailConfirmation = typeof body.emailConfirmation === 'string' ? body.emailConfirmation.trim().toLowerCase() : ''
  const suppliedToken = typeof body.registrationToken === 'string' ? body.registrationToken.trim() : ''
  const requestedSessions = Array.isArray(body.sessions) ? body.sessions : []
  const sessions = [...new Set(requestedSessions.filter((selection) => SESSION_SELECTIONS.has(selection)))]
  const environment = ENVIRONMENTS.has(body.environment) ? body.environment : ''

  if (!company || company.length > 160) {
    context.res = response(400, { error: 'Enter a valid company or organisation.' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    context.res = response(400, { error: 'Enter a valid company email address.' })
    return
  }
  if (email !== emailConfirmation) {
    context.res = response(400, { error: 'The company email addresses must match.' })
    return
  }
  if (suppliedToken && !REGISTRATION_TOKEN.test(suppliedToken)) {
    context.res = response(400, { error: 'The registration session is invalid. Refresh the page and try again.' })
    return
  }
  if (!sessions.length || sessions.length !== requestedSessions.length) {
    context.res = response(400, { error: 'Choose at least one valid date and session time.' })
    return
  }
  if (!environment || body.consent !== true) {
    context.res = response(400, { error: 'Choose an environment and provide data consent.' })
    return
  }

  const flowUrl = process.env.REGISTRATION_FLOW_URL
  const flowSecret = process.env.REGISTRATION_FLOW_SHARED_SECRET
  if (!flowUrl || !flowSecret) {
    context.res = response(503, { error: 'Registration storage is not configured yet.' })
    return
  }

  let parsedFlowUrl
  try {
    parsedFlowUrl = new URL(flowUrl)
  } catch {
    context.res = response(503, { error: 'Registration storage is not configured correctly.' })
    return
  }
  if (parsedFlowUrl.protocol !== 'https:') {
    context.res = response(503, { error: 'Registration storage requires a secure endpoint.' })
    return
  }

  const registrationToken = suppliedToken || randomUUID()
  const registrationId = createHash('sha256').update(`${EVENT_ID}:${registrationToken}`).digest('hex')
  const registrationEmailKey = createHash('sha256').update(`${EVENT_ID}:${email}`).digest('hex')
  const payload = {
    eventId: EVENT_ID,
    registrationId,
    registrationEmailKey,
    company,
    companyEmail: email,
    sessionSelections: sessions,
    environmentPreference: environment,
    consent: true,
    consentVersion: CONSENT.version,
    updatedAt: new Date().toISOString(),
  }

  let flowResponse
  try {
    flowResponse = await fetch(parsedFlowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-registration-secret': flowSecret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FLOW_TIMEOUT_MS),
    })
  } catch {
    context.res = response(502, { error: 'Registration storage is temporarily unavailable.' })
    return
  }

  const flowResult = await readFlowResult(flowResponse)
  // The browser's token belongs to a registration with a different email address, for example on
  // a shared device. Nothing was saved, and the token is not returned.
  if (flowResponse.status === 409 && flowResult.outcome === 'email-mismatch') {
    context.res = response(409, { error: EMAIL_MISMATCH, code: 'registration-email-mismatch' })
    return
  }
  if (!flowResponse.ok) {
    context.res = response(502, { error: 'Registration storage rejected the request.' })
    return
  }

  // A new registration ("created") and an email address that is already registered ("unchanged")
  // get the same answer, so the response never shows whether an address is registered.
  const outcome = flowResult.outcome === 'updated' ? 'updated' : 'received'
  context.res = response(202, { ok: true, outcome, registrationToken })
}
