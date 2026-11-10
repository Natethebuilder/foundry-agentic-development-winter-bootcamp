import siteState from '../api/site-state.json'
import { effectiveRegistrationState, registrationFormEmbedUrl } from './registration/microsoftForm.js'

// The public site's states live in api/site-state.json, which the registration API reads too.
//
// registration
//   1  Registration open: the form submits to /api/register.
//   2  Registration opening soon: every register entry point says registration will open soon and
//      the API refuses submissions. The form, API and flow stay in the codebase, so switching back
//      to 1 restores the working registration.
//   3  Registration closed: every register entry point says registration is closed and the API
//      refuses submissions.
//   4  Registration open through this bootcamp's Microsoft Form at "registrationFormUrl": every
//      register entry point leads to the form, embedded on the page, and the API refuses
//      submissions. Without a valid form link the site treats 4 as 3, and `vite build` fails.
//   Any other value is treated as 3, so a mistyped value never opens registration.
//
// prerequisites
//   "soon"       Prerequisites will be shared soon.
//   "microhack"  MicroHack lab preparation: Azure and Git basics, emailed Azure credentials, lab repos.
export const REGISTRATION_STATE = effectiveRegistrationState(siteState)
export const REGISTRATION_OPEN = REGISTRATION_STATE === 1 || REGISTRATION_STATE === 4
export const REGISTRATION_OPENS_SOON = REGISTRATION_STATE === 2
export const REGISTRATION_VIA_FORM = REGISTRATION_STATE === 4
export const REGISTRATION_FORM_URL = REGISTRATION_VIA_FORM ? siteState.registrationFormUrl : ''
export const REGISTRATION_FORM_EMBED_URL = REGISTRATION_VIA_FORM ? registrationFormEmbedUrl(REGISTRATION_FORM_URL) : ''
export const PREREQUISITES_STATE = siteState.prerequisites === 'microhack' ? 'microhack' : 'soon'
