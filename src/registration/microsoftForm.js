// Registration state 4 in api/site-state.json sends registrants to this bootcamp's Microsoft Form.
// Its "registrationFormUrl" must be a Microsoft Forms response page, for example
// https://forms.office.com/Pages/ResponsePage.aspx?id=<form id>. The site, the deck, the build
// (vite.config.js) and the tests all use these checks.
export const REGISTRATION_FORM_HOSTS = ['forms.office.com', 'forms.cloud.microsoft', 'forms.microsoft.com']
const RESPONSE_PAGE = '/Pages/ResponsePage.aspx'

export function isRegistrationFormUrl(value) {
  if (typeof value !== 'string' || /\s/.test(value)) return false
  let url
  try {
    url = new URL(value)
  } catch {
    return false
  }
  return url.protocol === 'https:'
    && REGISTRATION_FORM_HOSTS.includes(url.hostname)
    && !url.port && !url.username && !url.password
    && url.pathname === RESPONSE_PAGE
    && Boolean(url.searchParams.get('id')?.trim())
}

// The registration state the site shows. State 4 without a valid form link, and any value that is
// not a known state, show as closed (3).
export function effectiveRegistrationState(siteState) {
  const state = siteState?.registration
  if ([1, 2, 3].includes(state)) return state
  return state === 4 && isRegistrationFormUrl(siteState.registrationFormUrl) ? 4 : 3
}

// The same form in Microsoft Forms' embedded layout, for an iframe.
export function registrationFormEmbedUrl(formUrl) {
  const url = new URL(formUrl)
  url.searchParams.set('embed', 'true')
  return url.href
}

// Why `vite build` must stop for this site state, or '' when it can deploy.
export function registrationFormBuildError(siteState) {
  if (siteState?.registration !== 4 || isRegistrationFormUrl(siteState.registrationFormUrl)) return ''
  return 'api/site-state.json sets "registration": 4, but "registrationFormUrl" is not a Microsoft Forms link, '
    + 'so the site would show registration as closed. Set it to the form\'s link, '
    + 'https://forms.office.com/Pages/ResponsePage.aspx?id=<form id> (forms.cloud.microsoft and forms.microsoft.com also work), '
    + 'or choose another registration state.'
}
