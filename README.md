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

## Privacy

- **Footer links:** the website's footer and the footer bar of every deck slide link, in this order, to [Your Privacy Choices](https://go.microsoft.com/fwlink/?linkid=2214802), with the California Consumer Privacy Act (CCPA) opt-out icon to its left, [Consumer Health Privacy](https://go.microsoft.com/fwlink/?linkid=2259814) and [Privacy](https://go.microsoft.com/fwlink/?LinkId=521839), the Microsoft Privacy Statement. On phones, each slide shows them after its content. The links are in `src/privacy/LegalLinks.jsx`, and the icon, unmodified, is `public/privacy-choices.svg`.
- **Registration notice:** wherever the Microsoft Form is embedded or started (the Register section, before and after **Start registration**, and the deck's registration dialog), the site says why it collects the details, to register you for the bootcamp and send your invitation, and links to the Privacy Statement.
- **No cookies or tracking:** the site sets no cookies and loads no analytics, advertising, social media or other third-party scripts, so it has no cookie banner. Fonts and images are served from the site itself. Microsoft Forms loads only when a visitor starts registration or opens the deck's registration dialog.
- **Browser storage:** the site keeps three keys, all in `sessionStorage`, which the browser clears when the tab closes. Earlier versions kept `deck-navbar-dismissed` and the checklist ticks in `localStorage`; the site removes those copies when it loads (`src/privacy/storage.js`).

  | Key | Type | Purpose | Set | Lifetime |
  | --- | --- | --- | --- | --- |
  | `slide:foundry-agentic-development-winter-bootcamp` | `sessionStorage` | The deck's current slide, so a reload returns to it (set by DECKIO) | When the deck opens and on every slide change | Until the tab closes |
  | `deck-navbar-dismissed` | `sessionStorage` | Keeps the deck's slide navigation hidden once the visitor closes it | When the visitor selects **×** on the slide navigation | Until the tab closes |
  | `foundry-agentic-development-winter-bootcamp:prep` | `sessionStorage` | The ticks in the Get ready checklist, shown in prerequisites state `microhack` | When the visitor ticks or clears a box | Until the tab closes |

- **Retention:** all registration responses are deleted 30 days after the final session. See [Data retention and deletion](docs/registration-form/README.md#data-retention-and-deletion).

## Deploy

Pushing to `main` builds the site and deploys it to GitHub Pages through `.github/workflows/deploy.yml`, with the repository's Pages path as the base path. The site uses hash routes (`#/` and `#/deck`), so it needs no server rewrites.

GitHub Pages can't send response headers, so `npm run build` adds the content security policy and referrer policy to the page as meta tags (`securityPolicy()` in `vite.config.js`). The policy allows the page's inline scripts by their hashes, computed at build, and frames from Microsoft Forms only. The dev server runs without it.
