# Foundry Agentic Development registration backend

The public form uses the shared multi-event Power Automate flow and a dedicated private SharePoint List. GitHub OAuth and GitHub identity are not used for registration. In registration state `4`, registrations go to this bootcamp's Microsoft Form instead; see [Registration through a Microsoft Form](#registration-through-a-microsoft-form-state-4).

## SharePoint target

- Site: the bootcamp's private SharePoint site
- List: `Foundry Agentic Development Bootcamp Registrations`
- Classification: `Confidential \ Internal-Only`
- Privacy: private
- Permissions: inherited from the operations site
- Version history: enabled, 50 versions

| Column | Type | Purpose |
| --- | --- | --- |
| `Title` | Single line of text | Indexed email-key hash used for dedupe; legacy rows may temporarily contain the company email until lazily migrated |
| `RegistrationId` | Single line of text | Unique, indexed event-scoped identifier |
| `Company` | Single line of text | Company or organisation |
| `CompanyEmail` | Single line of text | Normalized communication address; immutable after the row is created |
| `SessionSelections` | Choice, multiple selections | The 36 allowlisted `YYYY-MM-DD|HH:MM|session-id` selections |
| `Sessions` | Multiple lines of text | Temporary semicolon-delimited compatibility copy |
| `Environment` | Choice | `local` or `cloud` |
| `OrganizationAccessStatus` | Choice | `Pending`, `Invitation queued`, `Invitation sent`, `Joined`, or `Issue` |
| `CloudEnvironmentStatus` | Choice | `Not requested`, `Requested`, `Allocated`, `Ready`, `Waitlisted`, or `Issue` |
| `Consent` | Yes/No | Explicit data consent |
| `ConsentVersion` | Single line of text | Optional. Version of the consent wording agreed on the latest submission; see [Consent wording versions](#consent-wording-versions) |
| `UpdatedAt` | Date and time | Latest submitted timestamp |

`GitHubUserId` and `GitHubUsername` are obsolete and should not exist in the final schema.

## Registration identity

The attendee enters the company email twice. The browser and API normalize both values and reject the submission unless they match.

The first accepted response returns an opaque UUID token stored in the browser. The API derives:

```text
SHA256("foundry-agentic-development-winter-bootcamp:" + registrationToken)
```

This lets the same browser update the same row without using the email address as an authentication credential. An update also needs the submitted email to match the row's `CompanyEmail`. If it doesn't, nothing is saved and the API answers HTTP `409`. Whenever the browser holds a token, the form shows **Not you? Start a new registration**, which deletes the token and clears the form, for example on a shared device.

The API separately derives a downstream-only email dedupe key:

```text
SHA256("foundry-agentic-development-winter-bootcamp:" + normalizedCompanyEmail)
```

`RegistrationEmailKey` is never accepted from the browser and is never returned to it. The shared flow stores the key in `Title` and, with `CompanyEmail`, uses it to stop the same normalized email from creating a second row from another browser. That submission saves nothing, and the API answers exactly as it does for a new registration, so the response never reveals whether an email address is registered.

## API payload

```json
{
  "eventId": "foundry-agentic-development-winter-bootcamp",
  "registrationId": "event-scoped SHA-256 value",
  "registrationEmailKey": "event-scoped normalized-email SHA-256 value",
  "company": "Example organisation",
  "companyEmail": "person@example.com",
  "sessionSelections": [
    "2026-12-04|09:00|foundations",
    "2027-01-22|14:30|govern"
  ],
  "environmentPreference": "local",
  "consent": true,
  "consentVersion": "2026-10-29",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

The flow's trigger schema sets `additionalProperties: false`, so it rejects any other field, including the retired `email`, `sessions` and `environment` aliases. `consentVersion` is optional in the schema (a string of 1-40 characters). The API always sends it from `api/consent.json`, and the browser cannot set it. See [Consent wording versions](#consent-wording-versions).

## API responses

The API waits up to 30 seconds for the flow (`FLOW_TIMEOUT_MS`). The flow can take several seconds just to accept a request, and Static Web Apps ends API requests after 45 seconds.

| Flow answer | API answer to the browser |
| --- | --- |
| `202` `{"ok":true,"outcome":"created"}` (new registration saved) | `202` `{"ok":true,"outcome":"received","registrationToken":"…"}` |
| `202` `{"ok":true,"outcome":"unchanged"}` (email already registered, nothing saved) | The same `received` answer |
| `202` without an `outcome`, or with one the API doesn't know | The same `received` answer |
| `202` `{"ok":true,"outcome":"updated"}` | `202` `{"ok":true,"outcome":"updated","registrationToken":"…"}` |
| `409` `{"ok":false,"outcome":"email-mismatch"}` | `409` with `code` `registration-email-mismatch`, the mismatch message and no token |
| Any other status, or no answer within 30 seconds | `502` |

For `received` the website shows one neutral message for both new and already registered email addresses: "Thanks, we’ve received your registration. If this email address was already registered, your original registration is unchanged. To change it, contact the Microsoft contact who invited you."

## Consent wording versions

The consent checkbox wording and its version live in `api/consent.json`. The website shows `wording`, and the API sends `version` to the flow as `consentVersion` with every submission.

A version is the date (`YYYY-MM-DD`, UTC) its wording went live on the site. To change the wording, set a new `version` and `wording` in `api/consent.json` and add a row to this table. Never edit a published row. `npm test` fails if this table has no row for the current version with its exact wording.

| Version | Live on the site from (UTC) | File | Wording |
| --- | --- | --- | --- |
| `2026-10-29` | 2026-10-29 01:22 | `api/consent.json` (`src/content.js` until versioning) | I consent to Microsoft using my company, company email, session choices and environment preference to administer the bootcamp, send the event invitation, provision access, communicate with me and improve the programme. Registration data is deleted after the administration period. |
| none | 2026-10-12 19:48 | `src/content.js` | I consent to Microsoft using my company, company email, session choices and environment preference to administer the bootcamp, send the GitHub organization invitation, provision access, communicate with me and improve the programme. Registration data is deleted after the administration period. |
| none | 2026-10-12 14:05 | `src/content.js` | I consent to Microsoft using my company, company email, session choices and environment preference to administer the bootcamp, send the Golden Ticket organization invitation, provision access, communicate with me and improve the programme. Registration data is deleted after the administration period. |
| none | 2026-10-11 15:03 | `src/content.js` | I consent to Microsoft using my company, company email, session choices, GitHub.com username and environment preference to administer the bootcamp, provision access, communicate with me and improve the programme. Registration data is deleted after the administration period. |
| none | 2026-10-11 13:33 | `src/content.js` | I agree that my registration details may be used to administer this bootcamp and its six sessions. |

The flow stores the version in the `ConsentVersion` column on every create and update. Rows last saved before the API started sending `consentVersion` have an empty `ConsentVersion`. Registrants agree to the wording shown on every submission, so the wording for such a row is the latest one live at its `UpdatedAt`. Live times are when the production deploy of the change finished. Earlier wordings stay in the git history of `src/content.js`.

## Schedule selection contract

Every Friday runs the same six sessions, at the same times as the Agentic Data Engineering Winter Bootcamp. The six dates are preliminary and subject to confirmation. Registration accepts all six sessions on each of these dates:

| Date | Session times |
| --- | --- |
| `2026-12-04` | `09:00`, `10:00`, `11:00`, `12:30`, `13:30`, `14:30` |
| `2026-12-11` | `09:00`, `10:00`, `11:00`, `12:30`, `13:30`, `14:30` |
| `2026-12-18` | `09:00`, `10:00`, `11:00`, `12:30`, `13:30`, `14:30` |
| `2027-01-08` | `09:00`, `10:00`, `11:00`, `12:30`, `13:30`, `14:30` |
| `2027-01-15` | `09:00`, `10:00`, `11:00`, `12:30`, `13:30`, `14:30` |
| `2027-01-22` | `09:00`, `10:00`, `11:00`, `12:30`, `13:30`, `14:30` |

The canonical stored selection format is:

```text
YYYY-MM-DD|HH:MM|session-id
```

Session times are fixed by session ID:

| Session ID | Time | Session | Replaces placeholder |
| --- | --- | --- | --- |
| `foundations` | `09:00` | Build it - Foundations | `09:30|session-01` |
| `advanced-patterns` | `10:00` | Build it - Advanced patterns | `10:30|session-02` |
| `evaluate` | `11:00` | Evaluate it | `11:30|session-03` |
| `deploy` | `12:30` | Deploy it | `13:00|session-04` |
| `operate` | `13:30` | Operate and integrate it | `14:00|session-05` |
| `govern` | `14:30` | Govern it | `15:00|session-06` |

The API allowlists exactly 36 combinations and rejects unknown dates, mismatched times, unknown session IDs, duplicate selections and the retired placeholder values.

**Before deploying this schedule**, replace the 36 placeholder values in the `SessionSelections` choice column with the 36 values above (for example `2026-12-04|09:00|foundations`), so the flow can write the new selections. Any existing rows that hold placeholder values can be mapped with the "Replaces placeholder" column.

## Registration states

`api/site-state.json` switches registration on and off without removing the working form, API or flow:

| `registration` | Website and deck | API |
| --- | --- | --- |
| `1` | Registration form is open | Validates and forwards submissions to the flow |
| `2` | Every register entry point says registration will open soon | Returns HTTP `403` "Registration will open soon." without calling the flow |
| `3` | Every register entry point says registration is closed, and the form is not shown | Returns HTTP `403` "Registration is closed." without calling the flow |
| `4` | Every register entry point leads to the bootcamp's Microsoft Form at `registrationFormUrl`, embedded on the page; the on-site form is not shown. Without a valid form link, treated as closed (`3`) | Returns HTTP `403` "Registration has moved to a new form. Refresh this page to register." without calling the flow |
| Any other value | Treated as closed (`3`) | Returns HTTP `403` "Registration is not open." without calling the flow |

Only `1` sends registrations to the API and the flow, so a missing or mistyped value fails closed.

The same file sets `prerequisites` to `"soon"` (prerequisites will be shared soon) or `"microhack"` (MicroHack lab preparation). Commit the change and push to `main` to deploy it.

## Registration through a Microsoft Form (state 4)

In state `4`, registrations are captured by this bootcamp's Microsoft Form, not by the registration API. Responses stay with the form owner in Microsoft Forms and its Excel workbook. They do not reach the SharePoint List or the flow, and the List's status columns are not set for them.

- **Switch to the form:** set `"registration": 4` and `"registrationFormUrl"` to the form's full link, `https://forms.office.com/Pages/ResponsePage.aspx?id=<form id>` (`forms.cloud.microsoft` and `forms.microsoft.com` also work; a short `/r/` link does not). Commit and push to `main`. If the link is not valid, `npm run build` fails, so the deploy stops and a broken form never goes live. `npm run dev` warns and shows registration as closed.
- **Switch back:** set `"registration": 1` to restore the on-site form, the API and the flow. Other states ignore `registrationFormUrl`. Responses already collected in the form are not copied into the List.
- **API:** submissions are refused with HTTP `403` and "Registration has moved to a new form. Refresh this page to register.", so a visitor with a cached page who submits the old form is told to reload.
- **Embedding:** the Register section lists what registrants need and loads nothing from Microsoft Forms until the visitor chooses **Start registration**; **Open the form in a new tab** is always available. The deck's registration dialog shows the form when it opens. The Content Security Policy in `public/staticwebapp.config.json` allows frames only from `forms.office.com`, `forms.cloud.microsoft` and `forms.microsoft.com`.
- **Consent:** the form's consent statement should use the current wording in `api/consent.json`. If that wording changes, update the form too.

## Confirmation email

**Not enabled yet.** The email waits for send access to the bootcamp's shared mailbox. Until then, the website tells registrants that their registration was received, that an email address that was already registered keeps its original registration, and that a formal invitation will follow by email.

Once enabled, in state 1 the flow sends each new registrant a confirmation email from the shared mailbox: "Thank you for registering, you will receive a formal invitation with more details closer to the date of the bootcamp." Send it only when a row is created (`created`), never on updates or when the email address is already registered (`unchanged`). Steps and the template are in [registration-confirmation-email.md](registration-confirmation-email.md).

## Shared flow behavior

The shared flow `Agentic Winter Bootcamps Registration Upsert` behaves as follows:

1. Invalid shared secrets return HTTP `401`.
2. `foundry-agentic-development-winter-bootcamp` routes only to this List.
3. Missing or unrecognized event IDs, and requests that don't match the trigger schema, return HTTP `400`. The schema sets `additionalProperties: false`, so alias fields are rejected.
4. Keep synchronous Response actions so validation and storage failures return the correct HTTP `400`, `401`, `409`, or `202` result only after SharePoint processing completes.
5. Configure secure inputs and outputs on steps that contain the shared secret or registration payload, restrict flow ownership, and use the shortest practical run-history retention period.
6. Look up the row by `RegistrationId` first.
7. If a row has that `RegistrationId` and its `CompanyEmail` equals the submitted `companyEmail` (ignoring case), update it and return HTTP `202` `{"ok":true,"outcome":"updated"}`.
8. If a row has that `RegistrationId` but a different `CompanyEmail`, save nothing and return HTTP `409` `{"ok":false,"outcome":"email-mismatch"}`.
9. If no row has that `RegistrationId`, look for a row whose `Title` equals `registrationEmailKey` or whose `CompanyEmail` equals the submitted email. If one exists, save nothing and return HTTP `202` `{"ok":true,"outcome":"unchanged"}`.
10. Only when neither the email key nor the email exists, create a row and return HTTP `202` `{"ok":true,"outcome":"created"}`.
11. Creates set `Title` to `registrationEmailKey`, store `RegistrationId`, the normalized `CompanyEmail`, and set `OrganizationAccessStatus` to `Pending`.
12. Creates set `CloudEnvironmentStatus` to `Requested` for cloud or `Not requested` for local.
13. Creates write the submitted `consentVersion` to `ConsentVersion`, or leave it empty if none was sent. Updates write the submitted value, or keep the stored one if none was sent.
14. Updates never change `CompanyEmail`.
15. Every update sets `Title` to `registrationEmailKey`, so a valid same-token, same-email update of a legacy row replaces its email-valued `Title`; no manual SharePoint Title backfill is required.
16. If `Company` changes, reset `OrganizationAccessStatus` to `Pending` when the existing approval or invitation state depends on the previous company.
17. If `Environment` changes, reset `CloudEnvironmentStatus` to `Requested` for cloud or `Not requested` for local so provisioning reflects the new request.
18. Otherwise, updates preserve both operational status fields.

The flow writes filterable `SessionSelections` and the temporary `Sessions` text copy.

## Operational view

Prioritize `CompanyEmail`, `Company`, `SessionSelections`, `Environment`, both status columns, `Consent`, and `UpdatedAt`. Hide `Title`, `RegistrationId`, and `Sessions` from the default view where practical.

## Azure Static Web Apps

- Resource group: `rg-agentic-ai-apps-winter-bootcamp`
- Static Web App: `swa-agentic-ai-apps-winter-bootcamp`

| Setting | Purpose |
| --- | --- |
| `REGISTRATION_FLOW_URL` | Shared flow endpoint |
| `REGISTRATION_FLOW_SHARED_SECRET` | Server-side secret validated by the flow |

Do not expose either value in source, documentation, browser responses, or logs.

## Event access

Registration does not grant any access by itself. Closer to the date, registrants receive a formal invitation with more details about the bootcamp and how to join their sessions.

## Verification

- The public site and registration API do not require GitHub sign-in.
- The disabled GitHub OAuth route returns `404`.
- Registration tests validate email confirmation, valid and invalid date-time-session selections, the retired placeholder values, all 36 valid selections, the registration states (only `1` accepts; `2`, `3`, `4` and unknown values are refused without calling the flow, and `4` answers with the moved-form message), the Microsoft Forms link check for state `4` (accepted and rejected links, the embed link, the closed fallback and the build error), backend settings, the 30-second flow timeout, and the canonical payload including `consentVersion`.
- Registration tests verify the normalized deterministic email key, caller override resistance, and preservation of the existing token-derived `RegistrationId`.
- Registration tests verify the answers: `updated`; one identical `received` answer for `created`, `unchanged`, a missing outcome and an unreadable body; `409` only for the flow's `email-mismatch`; and `502` for every other failure. Another test checks that this document lists the current consent version with its exact wording.
- Test submissions require explicit approval because they create or update SharePoint data.
- A create should initialize the two operational status fields.
- A create or update should store the current consent version in `ConsentVersion`.
- A repeat submission from the same browser with the same email should update the same row.
- A repeat submission from the same browser with a different email should save nothing and show the mismatch message.
- A submission from a different browser using an already registered normalized company email should save nothing, leave the row unchanged and show the same message as a new registration.
- A valid same-token, same-email update of a legacy row should replace the email-valued `Title` with the email-key hash.
- Company and environment changes should reset only the operational statuses described above.

The repository tests use a mocked flow. Confirm the live flow with approved test submissions whenever it changes.
