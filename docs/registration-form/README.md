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
  Every date runs the same six sessions, so pick a date for each session you want to attend. Dates are preliminary and subject to confirmation. Registration takes about two minutes.
  ```

## Questions

All six are required.

1. **Company or organisation**: text.
2. **Company email address**: email. Subtitle: "We send your formal event invitation to this address."
3. **Re-enter company email address**: email. Subtitle: "Enter the same address again to confirm it."
4. **Choose a date for each session**: Likert. Subtitle: "Every date runs the same six one-hour sessions. Choose a date for each session you want to attend, or None to skip it."
   - Statements: `09:00 · 01 · Build it - Foundations`, `10:00 · 02 · Build it - Advanced patterns`, `11:00 · 03 · Evaluate it`, `12:30 · 04 · Deploy it`, `13:30 · 05 · Operate and integrate it`, `14:30 · 06 · Govern it`
   - Options: `4 Dec`, `11 Dec`, `18 Dec`, `8 Jan`, `15 Jan`, `22 Jan`, `None`
5. **Development environment**: choice, with the options "I will use my own machine" and "I need a cloud development environment". Subtitle: "Use your own machine if you can install tools locally. Setup details follow with the prerequisites. Cloud places are limited, so choosing cloud records your request but does not guarantee a place."
6. **Data consent**: one checkbox with the current wording in `api/consent.json` (version `2026-10-29`).

## Settings

- Who can respond: Anyone can respond.
- Hide "Submit another response": on.
- Receipt of responses: on, so registrants can print a copy of their answers.
- Save and edit responses: off.
- Thank-you message: "Thank you for registering! You will receive a formal invitation with more details closer to the date of the bootcamp. To change your registration, contact the Microsoft contact who invited you."

## Differences from the on-site form

- The Likert question takes one date per session, and None skips a session.
- Forms cannot check that the two email addresses match. Compare them when processing responses.
- Forms does not require at least one session. Follow up on responses that choose None for every session.

## Embedding

The site adds `embed=true` to the link. Forms shows its desktop grid in frames about 760px wide or more, and date choices under each session in narrower frames. It renders inline only in frames at least 320px wide and about 320px tall, and shows a "Fill in the form" launcher in smaller ones. On screens 420px wide or less, the site's frames drop their padding, so the form renders inline on phones from 360px wide (`src/registration/MicrosoftFormRegistration.module.css`).
