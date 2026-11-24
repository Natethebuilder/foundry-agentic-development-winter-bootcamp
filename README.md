# Foundry Agentic Development Winter Bootcamp

Interactive public website and DECKIO presentation for a six-session community bootcamp across the agent lifecycle in Microsoft Foundry: build, ground, evaluate, deploy, operate and govern. It shares its design with the [Agentic Data Engineering Winter Bootcamp](https://github.com/Natethebuilder/agentic-data-winter-bootcamp), in a Foundry violet colourway.

| Route | Experience |
| --- | --- |
| `#/` | Website with the lineup, schedule, preparation, registration and FAQ |
| `#/deck` | DECKIO presentation with a slide per session and an embedded registration panel |

The complete six-session agenda runs on 4, 11 and 18 December 2026 and 8, 15 and 22 January 2027 (preliminary, subject to confirmation). The daily session times are 09:00, 10:00, 11:00, 12:30, 13:30 and 14:30, the same as the data bootcamp.

## Live

- Website: <https://natethebuilder.github.io/foundry-agentic-development-winter-bootcamp/>
- Deck: <https://natethebuilder.github.io/foundry-agentic-development-winter-bootcamp/#/deck>
- Short link: <https://aka.ms/FoundryBootcamp>

## Site states

`site-state.json` switches the public experience. The website and the deck both read it.

```json
{
  "registration": 4,
  "registrationFormUrl": "https://forms.office.com/Pages/ResponsePage.aspx?id=<form id>",
  "prerequisites": "soon"
}
```

| Setting | Value | Effect |
| --- | --- | --- |
| `registration` | `2` | Every register entry point says registration will open soon. |
| `registration` | `3` | Registration is closed. Every register entry point says so, and the form is not shown. |
| `registration` | `4` | Registration is open through this bootcamp's Microsoft Form at `registrationFormUrl`. Every register entry point leads to the form, which is embedded on the page. See [Registration](#registration). |
| `registrationFormUrl` | Microsoft Forms link | The form for state `4`: an `https` link on `forms.office.com`, `forms.cloud.microsoft` or `forms.microsoft.com` with the path `/Pages/ResponsePage.aspx` and an `id`. Other states ignore it. |
| `prerequisites` | `"soon"` | The Get ready section says the information will be shared soon. |
| `prerequisites` | `"microhack"` | The Get ready section and deck show the MicroHack lab preparation: Azure and Git basics, an email address for temporary Azure credentials, one lab repository per session, and GitHub only if needed. |

Any other `registration` value, including `1` (the retired on-site form), is treated as closed, so a missing or mistyped value never opens registration. State `4` without a valid `registrationFormUrl` is treated as closed too, and `npm run build` fails, so a broken form link never deploys. Commit the change and push to `main` to deploy it. Set `BOOTCAMP.datesConfirmed` in `src/content.js` to `true` once the dates are confirmed to remove the "preliminary" labels.

## Develop

```powershell
npm install
npm test
npm run dev
npm run build
```

`npm test` checks the Microsoft Forms link rules and the committed `site-state.json`. Builds use `/` as the base path unless `BASE_PATH` is set; the deploy workflow sets it to the GitHub Pages path, `/foundry-agentic-development-winter-bootcamp/`.

## Content

- Update the shared site and deck content in `src/content.js`. Sessions and owners follow the Foundry Bootcamp deck (v7).
- Session owners are hidden for now: `SHOW_SESSION_OWNERS` in `src/content.js` is `false`, and their headshots are not published. To show them again, restore the headshots with `git checkout f33f10f -- public/speakers`, then set `SHOW_SESSION_OWNERS` to `true`. They reappear in the lineup, schedule, deck session slides and team slide.
- Session-owner headshots live in `public/speakers/` as square JPGs and are referenced by `photo` in `TEAM`. People without a photo show their initials.
- Update slide composition in `src/slides/WinterSlides.jsx` and ordering in `deck.config.js`.
- The palette is set in the `:root` variables at the top of `src/index.css`.

## Registration

Registrations go to this bootcamp's Microsoft Form (registration state `4`). The website's Register section lists what registrants need and loads nothing from Microsoft Forms until the visitor chooses **Start registration**; **Open the form in a new tab** is always available. The deck's registration dialog loads the form when it opens. Responses stay with the form owner in Microsoft Forms and its Excel workbook. The form's link, questions, settings and design are recorded in [docs/registration-form](docs/registration-form/README.md).

## Deploy

Pushing to `main` builds the site and deploys it to GitHub Pages through `.github/workflows/deploy.yml`, with the repository's Pages path as the base path. The site uses hash routes (`#/` and `#/deck`), so it needs no server rewrites.

GitHub Pages can't send response headers, so `npm run build` adds the content security policy and referrer policy to the page as meta tags (`securityPolicy()` in `vite.config.js`). The policy allows the page's inline scripts by their hashes, computed at build, and frames from Microsoft Forms only. The dev server runs without it.
