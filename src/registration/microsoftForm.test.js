import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  effectiveRegistrationState, isRegistrationFormUrl, registrationFormBuildError, registrationFormEmbedUrl,
} from './microsoftForm.js'

const FORM_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAN__hYqKRhUQ1ZBWkdHQTc5Ti4u'

test('accepts only Microsoft Forms response pages as the registration form', () => {
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
    'https://registrant@forms.office.com/Pages/ResponsePage.aspx?id=abc123',
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

test('embeds the registration form with embed=true', () => {
  assert.equal(registrationFormEmbedUrl(FORM_URL), `${FORM_URL}&embed=true`)
  assert.equal(registrationFormEmbedUrl(`${FORM_URL}&embed=true`), `${FORM_URL}&embed=true`)
  assert.equal(registrationFormEmbedUrl(`${FORM_URL}&embed=false`), `${FORM_URL}&embed=true`)
})

test('shows state 4 without a valid form link, the retired state 1 and unknown states as closed', () => {
  for (const registration of [2, 3]) {
    assert.equal(effectiveRegistrationState({ registration, registrationFormUrl: '' }), registration)
  }
  assert.equal(effectiveRegistrationState({ registration: 4, registrationFormUrl: FORM_URL }), 4)
  assert.equal(effectiveRegistrationState({ registration: 4, registrationFormUrl: '' }), 3)
  assert.equal(effectiveRegistrationState({ registration: 4 }), 3)
  assert.equal(effectiveRegistrationState({ registration: 4, registrationFormUrl: 'https://example.com/register' }), 3)
  for (const registration of [0, 1, 5, '1', '4', null, undefined]) {
    assert.equal(effectiveRegistrationState({ registration, registrationFormUrl: FORM_URL }), 3, `state ${registration}`)
  }
  assert.equal(effectiveRegistrationState(undefined), 3)
})

test('the build stops when state 4 has no valid form link', () => {
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

test('the committed site state is valid for a deploy', () => {
  const committed = JSON.parse(readFileSync(new URL('../../site-state.json', import.meta.url), 'utf8'))
  assert.ok([2, 3, 4].includes(committed.registration), `registration ${JSON.stringify(committed.registration)}`)
  assert.equal(registrationFormBuildError(committed), '')
})
