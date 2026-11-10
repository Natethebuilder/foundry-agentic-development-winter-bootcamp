const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const register = require('./index.js')
const siteState = require('../site-state.json')
const CONSENT = require('../consent.json')

// Run against open registration whatever api/site-state.json is committed as, so switching the live
// site to state 2, 3 or 4 never blocks a deploy. The state tests switch it explicitly.
siteState.registration = 1

// The site, the deck and the build share these checks for registration state 4 (src is ES modules).
const microsoftForm = () => import('../../src/registration/microsoftForm.js')
const FORM_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAN__hYqKRhUQ1ZBWkdHQTc5Ti4u'
const MOVED = 'Registration has moved to a new form. Refresh this page to register.'

const registrationToken = '123e4567-e89b-42d3-a456-426614174000'
const DATES = ['2026-12-04', '2026-12-11', '2026-12-18', '2027-01-08', '2027-01-15', '2027-01-22']
const SESSIONS = [
  ['foundations', '09:00'],
  ['advanced-patterns', '10:00'],
  ['evaluate', '11:00'],
  ['deploy', '12:30'],
  ['operate', '13:30'],
  ['govern', '14:30'],
]

function request(body) {
  return { headers: {}, body }
}

function validBody() {
  return {
    company: 'Example Org',
    email: 'Builder@Example.com',
    emailConfirmation: 'builder@example.com',
    registrationToken,
    sessions: [
      '2026-12-04|09:00|foundations',
      '2027-01-22|14:30|govern',
    ],
    environment: 'cloud',
    consent: true,
  }
}

function configuredEnvironment() {
  process.env.REGISTRATION_FLOW_URL = 'https://flow.example.test/register'
  process.env.REGISTRATION_FLOW_SHARED_SECRET = 'test-only-secret'
}

// A flow response with a status code and a JSON (or raw text) body.
function flowAnswer(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }
}

async function registerWithFlowAnswer(answer) {
  configuredEnvironment()
  global.fetch = async () => answer
  const context = {}
  await register(context, request(validBody()))
  return context.res
}

test('rejects mismatched email confirmation', async () => {
  configuredEnvironment()
  const context = {}
  const body = validBody()
  body.emailConfirmation = 'different@example.com'
  await register(context, request(body))
  assert.equal(context.res.status, 400)
})

test('rejects duplicate date-time-session selections', async () => {
  configuredEnvironment()
  const context = {}
  const body = validBody()
  body.sessions = [
    '2026-12-04|09:00|foundations',
    '2026-12-04|09:00|foundations',
  ]
  await register(context, request(body))
  assert.equal(context.res.status, 400)
})

test('rejects an unknown date-time-session selection', async () => {
  configuredEnvironment()
  const context = {}
  const body = validBody()
  body.sessions = ['2026-12-05|09:00|foundations']
  await register(context, request(body))
  assert.equal(context.res.status, 400)
})

test('rejects a valid date paired with the wrong session time', async () => {
  configuredEnvironment()
  const context = {}
  const body = validBody()
  body.sessions = ['2026-12-04|10:00|foundations']
  await register(context, request(body))
  assert.equal(context.res.status, 400)
})

test('rejects the retired placeholder selections', async () => {
  configuredEnvironment()
  const context = {}
  const body = validBody()
  body.sessions = ['2026-12-04|09:30|session-01']
  await register(context, request(body))
  assert.equal(context.res.status, 400)
})

test('accepts every session on every date', async () => {
  configuredEnvironment()
  let received
  global.fetch = async (url, options) => {
    received = JSON.parse(options.body)
    return { ok: true }
  }
  const body = validBody()
  body.sessions = DATES.flatMap((date) => SESSIONS.map(([id, time]) => `${date}|${time}|${id}`))
  const context = {}
  await register(context, request(body))
  assert.equal(context.res.status, 202)
  assert.equal(received.sessionSelections.length, 36)
})

test('accepts registrations only in state 1', async () => {
  configuredEnvironment()
  let calls = 0
  global.fetch = async () => {
    calls += 1
    return flowAnswer(202, { ok: true, outcome: 'created' })
  }
  const refusals = [
    [2, 'Registration will open soon.'],
    [3, 'Registration is closed.'],
    [0, 'Registration is not open.'],
    [4, MOVED],
    [5, 'Registration is not open.'],
    ['1', 'Registration is not open.'],
    ['4', 'Registration is not open.'],
    [null, 'Registration is not open.'],
    [undefined, 'Registration is not open.'],
  ]
  const original = siteState.registration
  try {
    for (const [state, error] of refusals) {
      siteState.registration = state
      const context = {}
      await register(context, request(validBody()))
      assert.equal(context.res.status, 403, `state ${state}`)
      assert.deepEqual(context.res.body, { error }, `state ${state}`)
    }
    assert.equal(calls, 0)

    siteState.registration = 1
    const context = {}
    await register(context, request(validBody()))
    assert.equal(context.res.status, 202)
    assert.equal(calls, 1)
  } finally {
    siteState.registration = original
  }
})

test('state 4 sends visitors to the new form without calling the flow', async () => {
  configuredEnvironment()
  let calls = 0
  global.fetch = async () => {
    calls += 1
    return flowAnswer(202, { ok: true, outcome: 'created' })
  }
  const original = siteState.registration
  try {
    siteState.registration = 4
    const context = {}
    await register(context, request(validBody()))
    assert.equal(context.res.status, 403)
    assert.equal(context.res.headers['Cache-Control'], 'no-store')
    assert.deepEqual(context.res.body, { error: MOVED })
    assert.equal(calls, 0)
  } finally {
    siteState.registration = original
  }
})

test('accepts only Microsoft Forms response pages as the registration form', async () => {
  const { isRegistrationFormUrl } = await microsoftForm()
  const accepted = [
    FORM_URL,
    'https://forms.office.com/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.microsoft.com/Pages/ResponsePage.aspx?id=abc123',
    'https://FORMS.Office.com/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.office.com/Pages/ResponsePage.aspx?id=abc123&embed=true',
    'https://forms.office.com/Pages/ResponsePage.aspx?origin=lprLink&id=abc123',
  ]
  for (const url of accepted) assert.equal(isRegistrationFormUrl(url), true, url)

  const rejected = [
    '',
    undefined,
    null,
    4,
    { href: FORM_URL },
    'forms.office.com/Pages/ResponsePage.aspx?id=abc123',
    'http://forms.office.com/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.office.com.example.com/Pages/ResponsePage.aspx?id=abc123',
    'https://evilforms.office.com/Pages/ResponsePage.aspx?id=abc123',
    'https://eu.forms.office.com/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.example.com/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.office.com:8443/Pages/ResponsePage.aspx?id=abc123',
    'https://user:secret@forms.office.com/Pages/ResponsePage.aspx?id=abc123',
    'https://forms.office.com/Pages/ResponsePage.aspx/?id=abc123',
    'https://forms.office.com/Pages/DesignPageV2.aspx?id=abc123',
    'https://forms.office.com/r/abc123',
    'https://forms.office.com/Pages/ResponsePage.aspx',
    'https://forms.office.com/Pages/ResponsePage.aspx?id=',
    'https://forms.office.com/Pages/ResponsePage.aspx?id=%20%20',
    'https://forms.office.com/Pages/ResponsePage.aspx?form=abc123',
    ` ${FORM_URL}`,
    `${FORM_URL}\n`,
  ]
  for (const value of rejected) assert.equal(isRegistrationFormUrl(value), false, JSON.stringify(value))
})

test('embeds the registration form with embed=true', async () => {
  const { registrationFormEmbedUrl } = await microsoftForm()
  assert.equal(registrationFormEmbedUrl(FORM_URL), `${FORM_URL}&embed=true`)
  assert.equal(registrationFormEmbedUrl(`${FORM_URL}&embed=true`), `${FORM_URL}&embed=true`)
  assert.equal(registrationFormEmbedUrl(`${FORM_URL}&embed=false`), `${FORM_URL}&embed=true`)
})

test('state 4 shows as closed without a valid form link', async () => {
  const { effectiveRegistrationState } = await microsoftForm()
  for (const registration of [1, 2, 3]) {
    assert.equal(effectiveRegistrationState({ registration, registrationFormUrl: '' }), registration)
  }
  assert.equal(effectiveRegistrationState({ registration: 4, registrationFormUrl: FORM_URL }), 4)
  assert.equal(effectiveRegistrationState({ registration: 4, registrationFormUrl: '' }), 3)
  assert.equal(effectiveRegistrationState({ registration: 4 }), 3)
  assert.equal(effectiveRegistrationState({ registration: 4, registrationFormUrl: 'https://example.com/register' }), 3)
  for (const registration of [0, 5, '1', '4', null, undefined]) {
    assert.equal(effectiveRegistrationState({ registration, registrationFormUrl: FORM_URL }), 3, `state ${registration}`)
  }
  assert.equal(effectiveRegistrationState(undefined), 3)
})

test('the build stops when state 4 has no valid form link', async () => {
  const { registrationFormBuildError } = await microsoftForm()
  for (const registrationFormUrl of ['', undefined, 'https://example.com/register', 'https://forms.office.com/r/abc123']) {
    const error = registrationFormBuildError({ registration: 4, registrationFormUrl })
    assert.match(error, /"registration": 4/)
    assert.match(error, /registrationFormUrl/)
    assert.match(error, /https:\/\/forms\.office\.com\/Pages\/ResponsePage\.aspx\?id=<form id>/)
  }
  assert.equal(registrationFormBuildError({ registration: 4, registrationFormUrl: FORM_URL }), '')
  for (const registration of [1, 2, 3, 5, '4', undefined]) {
    assert.equal(registrationFormBuildError({ registration, registrationFormUrl: '' }), '', `state ${registration}`)
  }
})

test('requires shared backend settings', async () => {
  delete process.env.REGISTRATION_FLOW_URL
  delete process.env.REGISTRATION_FLOW_SHARED_SECRET
  const context = {}
  await register(context, request(validBody()))
  assert.equal(context.res.status, 503)
})

test('forwards an anonymous event-routed upsert payload', async () => {
  configuredEnvironment()
  let received
  global.fetch = async (url, options) => {
    received = { url, options, body: JSON.parse(options.body) }
    return { ok: true }
  }

  const context = {}
  await register(context, request(validBody()))

  assert.equal(context.res.status, 202)
  assert.equal(String(received.url), 'https://flow.example.test/register')
  assert.equal(received.options.headers['x-registration-secret'], 'test-only-secret')
  assert.equal(received.body.eventId, 'foundry-agentic-development-winter-bootcamp')
  assert.equal(received.body.companyEmail, 'builder@example.com')
  assert.deepEqual(received.body.sessionSelections, validBody().sessions)
  assert.equal(received.body.environmentPreference, 'cloud')
  assert.equal('githubUserId' in received.body, false)
  assert.equal('githubUsername' in received.body, false)
  assert.equal('email' in received.body, false)
  assert.equal('sessions' in received.body, false)
  assert.equal('environment' in received.body, false)
  assert.equal(
    received.body.registrationId,
    createHash('sha256').update(`foundry-agentic-development-winter-bootcamp:${registrationToken}`).digest('hex'),
  )
  assert.equal(
    received.body.registrationEmailKey,
    createHash('sha256').update('foundry-agentic-development-winter-bootcamp:builder@example.com').digest('hex'),
  )
  assert.equal(context.res.body.registrationToken, registrationToken)
  assert.equal('registrationEmailKey' in context.res.body, false)
})

test('normalizes company email before deriving the deterministic downstream email key', async () => {
  configuredEnvironment()
  let received
  global.fetch = async (url, options) => {
    received = { url, body: JSON.parse(options.body) }
    return { ok: true }
  }

  const body = validBody()
  body.email = '  BUILDER@Example.COM  '
  body.emailConfirmation = 'builder@example.com'
  const context = {}
  await register(context, request(body))

  assert.equal(context.res.status, 202)
  assert.equal(received.body.companyEmail, 'builder@example.com')
  assert.equal(
    received.body.registrationEmailKey,
    createHash('sha256').update('foundry-agentic-development-winter-bootcamp:builder@example.com').digest('hex'),
  )
})

test('ignores caller attempts to override server-derived registration identifiers', async () => {
  configuredEnvironment()
  let received
  global.fetch = async (url, options) => {
    received = { url, body: JSON.parse(options.body) }
    return { ok: true }
  }

  const body = {
    ...validBody(),
    registrationId: 'caller-registration-id',
    registrationEmailKey: 'caller-email-key',
  }
  const context = {}
  await register(context, request(body))

  assert.equal(context.res.status, 202)
  assert.equal(
    received.body.registrationId,
    createHash('sha256').update(`foundry-agentic-development-winter-bootcamp:${registrationToken}`).digest('hex'),
  )
  assert.equal(
    received.body.registrationEmailKey,
    createHash('sha256').update('foundry-agentic-development-winter-bootcamp:builder@example.com').digest('hex'),
  )
  assert.equal(context.res.body.registrationToken, registrationToken)
  assert.equal('registrationId' in context.res.body, false)
  assert.equal('registrationEmailKey' in context.res.body, false)
})

test('gives a slow flow time to answer within the 45 s Static Web Apps limit', async () => {
  configuredEnvironment()
  const timeout = AbortSignal.timeout
  let timeoutMs
  AbortSignal.timeout = (ms) => {
    timeoutMs = ms
    return timeout.call(AbortSignal, ms)
  }
  global.fetch = async () => ({ ok: true })

  const context = {}
  try {
    await register(context, request(validBody()))
  } finally {
    AbortSignal.timeout = timeout
  }

  assert.equal(context.res.status, 202)
  assert.ok(timeoutMs >= 20_000)
  assert.ok(timeoutMs < 45_000)
})

test('reports an updated registration', async () => {
  const res = await registerWithFlowAnswer(flowAnswer(202, { ok: true, outcome: 'updated' }))
  assert.equal(res.status, 202)
  assert.deepEqual(res.body, { ok: true, outcome: 'updated', registrationToken })
})

test('answers a new registration and an already registered email address identically', async () => {
  const received = { status: 202, body: { ok: true, outcome: 'received', registrationToken } }
  const answers = {
    created: flowAnswer(202, { ok: true, outcome: 'created' }),
    unchanged: flowAnswer(202, { ok: true, outcome: 'unchanged' }),
    'no outcome': flowAnswer(202, { ok: true }),
    'an unknown outcome': flowAnswer(202, { ok: true, outcome: 'something-new' }),
    'an empty body': flowAnswer(202, ''),
    'a body that is not JSON': flowAnswer(202, 'Accepted'),
    'a body that cannot be read': { ok: true, status: 202 },
  }
  for (const [name, answer] of Object.entries(answers)) {
    const res = await registerWithFlowAnswer(answer)
    assert.deepEqual({ status: res.status, body: res.body }, received, name)
  }
})

test('refuses a saved registration whose email address differs, without returning the token', async () => {
  const res = await registerWithFlowAnswer(flowAnswer(409, { ok: false, outcome: 'email-mismatch' }))
  assert.equal(res.status, 409)
  assert.deepEqual(res.body, {
    error: 'This email address doesn\u2019t match the registration saved in this browser. Check the address, or choose "Not you? Start a new registration".',
    code: 'registration-email-mismatch',
  })
})

test('reports every other flow failure as a storage error', async () => {
  const failures = [
    flowAnswer(409, { ok: false }),
    flowAnswer(409, 'Conflict'),
    flowAnswer(400, { error: 'schema' }),
    flowAnswer(401, ''),
    flowAnswer(500, { ok: false, outcome: 'email-mismatch' }),
    flowAnswer(502, 'Bad Gateway'),
  ]
  for (const answer of failures) {
    const res = await registerWithFlowAnswer(answer)
    assert.equal(res.status, 502, `flow status ${answer.status}`)
    assert.deepEqual(res.body, { error: 'Registration storage rejected the request.' })
  }
})

test('sends the current consent wording version, never one supplied by the caller', async () => {
  configuredEnvironment()
  let received
  global.fetch = async (url, options) => {
    received = JSON.parse(options.body)
    return flowAnswer(202, { ok: true, outcome: 'created' })
  }

  const context = {}
  await register(context, request({ ...validBody(), consentVersion: 'caller-version' }))

  assert.equal(context.res.status, 202)
  assert.match(CONSENT.version, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(received.consentVersion, CONSENT.version)
})

test('documents the current consent wording version', () => {
  const docs = readFileSync(path.join(__dirname, '../../docs/registration-backend.md'), 'utf8')
  const row = docs.split('\n').find((line) => line.startsWith(`| \`${CONSENT.version}\` |`))
  assert.ok(row, `docs/registration-backend.md has no row for consent version ${CONSENT.version}`)
  assert.ok(row.includes(CONSENT.wording), 'the documented wording must match api/consent.json exactly')
})
