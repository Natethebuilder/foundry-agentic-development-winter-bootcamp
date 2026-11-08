# Foundry Agentic Development Winter Bootcamp

Interactive public website and DECKIO presentation for a six-session community bootcamp across the agent lifecycle in Microsoft Foundry: build, ground, evaluate, deploy, operate and govern. It shares its design with the [Agentic Data Engineering Winter Bootcamp](https://github.com/Natethebuilder/agentic-data-winter-bootcamp), in a Foundry violet colourway.

| Route | Experience |
| --- | --- |
| `#/` | Website with the lineup, schedule, preparation, registration and FAQ |
| `#/deck` | DECKIO presentation with a slide per session and an embedded registration panel |

The complete six-session agenda runs on 4, 11 and 18 December 2026 and 8, 15 and 22 January 2027 (preliminary, subject to confirmation). The daily session times are 09:00, 10:00, 11:00, 12:30, 13:30 and 14:30, the same as the data bootcamp.

## Live

- Website: <https://mango-mushroom-0c5c73e0f.6.azurestaticapps.net/>
- Deck: <https://mango-mushroom-0c5c73e0f.6.azurestaticapps.net/#/deck>
- Short link: <https://aka.ms/FoundryBootcamp>

## Site states

`api/site-state.json` switches the public experience. The website, the deck and the registration API all read it.

```json
{
  "registration": 1,
  "prerequisites": "soon"
}
```

| Setting | Value | Effect |
| --- | --- | --- |
| `registration` | `1` | Registration is open. |
| `registration` | `2` | Every register entry point says registration will open soon, and the API refuses submissions. The form, API and flow stay in place, so switching back to `1` restores registration. |
| `registration` | `3` | Registration is closed. Every register entry point says so, the form is not shown, and the API refuses submissions. |
| `prerequisites` | `"soon"` | The Get ready section says the information will be shared soon. |
| `prerequisites` | `"microhack"` | The Get ready section and deck show the MicroHack lab preparation: Azure and Git basics, an email address for temporary Azure credentials, one lab repository per session, and GitHub only if needed. |

Any other `registration` value is treated as closed, so a missing or mistyped value never opens registration. Commit the change and push to `main` to deploy it. Set `BOOTCAMP.datesConfirmed` in `src/content.js` to `true` once the dates are confirmed to remove the "preliminary" labels.

## Develop

```powershell
npm install
npm test
npm run dev
npm run build
npm run build:swa
```

## Content

- Update the shared site and deck content in `src/content.js`. Sessions and owners follow the Foundry Bootcamp deck (v7).
- The registration consent wording and its version live in `api/consent.json`. To change the wording, follow [Consent wording versions](docs/registration-backend.md#consent-wording-versions).
- Session owners are hidden for now: `SHOW_SESSION_OWNERS` in `src/content.js` is `false`, and their headshots are not published. To show them again, restore the headshots with `git checkout f33f10f -- public/speakers`, then set `SHOW_SESSION_OWNERS` to `true`. They reappear in the lineup, schedule, registration form, deck session slides and team slide.
- Session-owner headshots live in `public/speakers/` as square JPGs and are referenced by `photo` in `TEAM`. People without a photo show their initials.
- Update slide composition in `src/slides/WinterSlides.jsx` and ordering in `deck.config.js`.
- The palette is set in the `:root` variables at the top of `src/index.css`.

## Registration architecture

Azure Static Web Apps hosts the website, deck and registration API on one origin. The registration API:

1. validates company, matching email entries, date and session selections, environment and consent;
2. uses a browser-held opaque token to derive an event-scoped SHA-256 `RegistrationId`;
3. sends canonical company-email, session-selection and environment-preference fields without GitHub identity, plus the consent wording version (`consentVersion`) from `api/consent.json`;
4. sends `eventId: foundry-agentic-development-winter-bootcamp` to the shared registration flow;
5. lets that flow route the submission into the dedicated Foundry Agentic Development SharePoint List and initialize its operational statuses.

After submitting, registrants see that their registration was received and that a formal invitation will follow by email closer to the date. The message is the same whether or not the email address was already registered, and an existing registration is never changed from another browser. A browser that holds a registration shows **Not you? Start a new registration**, which forgets it so someone else can register on the same device. The automatic confirmation email is not enabled yet because it needs send access to the bootcamp's shared mailbox. The steps to add it are in [docs/registration-confirmation-email.md](docs/registration-confirmation-email.md).

| Setting | Purpose |
| --- | --- |
| `REGISTRATION_FLOW_URL` | Existing shared registration flow endpoint |
| `REGISTRATION_FLOW_SHARED_SECRET` | Server-side secret validated by the shared flow |

Never commit either value. See [docs/registration-backend.md](docs/registration-backend.md), including the `SessionSelections` choice values to update before deploying the confirmed schedule.

## Deploy

Pushing to `main` deploys through `.github/workflows/deploy.yml` using the repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN_FOUNDRY_AGENTIC_DEVELOPMENT`. The existing Azure Static Web Apps resource is reused.
