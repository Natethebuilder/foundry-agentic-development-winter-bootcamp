import siteState from '../api/site-state.json'

// The public site's states live in api/site-state.json, which the registration API reads too.
//
// registration
//   1  Registration open: the form submits to /api/register.
//   2  Registration opening soon: every register entry point says registration will open soon and
//      the API refuses submissions. The form, API and flow stay in the codebase, so switching back
//      to 1 restores the working registration.
//   3  Registration closed: every register entry point says registration is closed and the API
//      refuses submissions.
//   Any other value is treated as 3, so a mistyped value never opens registration.
//
// prerequisites
//   "soon"       Prerequisites will be shared soon.
//   "microhack"  MicroHack lab preparation: Azure and Git basics, emailed Azure credentials, lab repos.
export const REGISTRATION_STATE = [1, 2, 3].includes(siteState.registration) ? siteState.registration : 3
export const REGISTRATION_OPEN = REGISTRATION_STATE === 1
export const REGISTRATION_OPENS_SOON = REGISTRATION_STATE === 2
export const PREREQUISITES_STATE = siteState.prerequisites === 'microhack' ? 'microhack' : 'soon'
