# Registration form

This bootcamp's Microsoft Form takes registrations in registration state `4`. The site embeds it from `registrationFormUrl` in `api/site-state.json` (see [Registration through a Microsoft Form](../registration-backend.md#registration-through-a-microsoft-form-state-4)). This page records the form so it can be rebuilt. If the schedule or the consent wording changes, update the form too.

- **Link:** <https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRxdEa3AwZX5OnfloSBL3H3tURUEzRjMwRFk0QlpOWUpDN0Q0Nzc1WVdYUi4u>
- **Responses:** stay with the form owner in Microsoft Forms and its Excel workbook. They do not reach the SharePoint List or the registration flow.

## Design

- **Theme colour:** `#4f37d6`
- **Background image:** [background.png](background.png) (1920×1080)
- **Header image:** [tile.png](tile.png) (1280×720), alt text "Foundry Agentic Development Winter Bootcamp logo with the GitHub Copilot mascot"
- **Title:** Foundry Agentic Development Winter Bootcamp registration
- **Description**, in three lines:

  ```text
  Build, evaluate and operate AI agents with Microsoft Foundry. Six practical sessions across the agent lifecycle, from a working agent to deployment, operations and organisational governance.
  Winter 2026/27 · Online · Free · Six one-hour sessions
  Every date runs the same six sessions, so pick as many sessions as you like, on as many dates as you like. Dates are preliminary and subject to confirmation. Registration takes about two minutes.
  ```

## Questions

Questions 1 to 3, 10 and 11 are required. Questions 4 to 9 are one optional choice question per session, with multiple answers on and the six dates as options: `4 Dec`, `11 Dec`, `18 Dec`, `8 Jan`, `15 Jan`, `22 Jan`.

1. **Company or organisation**: text.
2. **Company email address**: email. Subtitle: "We send your formal event invitation to this address."
3. **Re-enter company email address**: email. Subtitle: "Enter the same address again to confirm it."
4. **09:00 · 01 · Build it - Foundations**: session dates. Subtitle: "Every date runs the same six one-hour sessions. Tick every date you want to attend for each session, and leave a session blank to skip it."
5. **10:00 · 02 · Build it - Advanced patterns**: session dates.
6. **11:00 · 03 · Evaluate it**: session dates.
7. **12:30 · 04 · Deploy it**: session dates.
8. **13:30 · 05 · Operate and integrate it**: session dates.
9. **14:30 · 06 · Govern it**: session dates.
10. **Development environment**: choice, with the options "I will use my own machine" and "I need a cloud development environment". Subtitle: "Use your own machine if you can install tools locally. Setup details follow with the prerequisites. Cloud places are limited, so choosing cloud records your request but does not guarantee a place."
11. **Data consent**: one checkbox with the current wording in `api/consent.json` (version `2026-10-29`).

## Settings

- Who can respond: Anyone can respond.
- Hide "Submit another response": on.
- Receipt of responses: on, so registrants can print a copy of their answers.
- Save and edit responses: off.
- Thank-you message: "Thank you for registering! You will receive a formal invitation with more details closer to the date of the bootcamp. To change your registration, contact the Microsoft contact who invited you."

## Differences from the on-site form

- Forms cannot check that the two email addresses match. Compare them when processing responses.
- Forms does not require at least one session. Follow up on responses with no dates ticked.

## Embedding

The site adds `embed=true` to the link. Forms renders the form inline only in frames at least 320px wide and about 320px tall, and shows a "Fill in the form" launcher in smaller ones. On screens 420px wide or less, the site's frames drop their padding, so the form renders inline on phones from 360px wide (`src/registration/MicrosoftFormRegistration.module.css`).
