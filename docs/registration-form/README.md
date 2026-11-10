# Registration form

This bootcamp's Microsoft Form takes registrations in registration state `4`. The site embeds it from `registrationFormUrl` in `api/site-state.json` (see [Registration through a Microsoft Form](../registration-backend.md#registration-through-a-microsoft-form-state-4)). This page records the form so it can be rebuilt. If the schedule or the consent wording changes, update the form too.

- **Link:** <https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRxdEa3AwZX5OnfloSBL3H3tURUEzRjMwRFk0QlpOWUpDN0Q0Nzc1WVdYUi4u>
- **Responses:** stay with the form owner in Microsoft Forms and its Excel workbook. They do not reach the SharePoint List or the registration flow.

## Design

- **Theme colour:** `#4f37d6`
- **Background image:** [background.png](background.png) (1920×1080)
- **Header image:** [tile.png](tile.png) (1280×720), alt text "Foundry Agentic Development Winter Bootcamp logo with the GitHub Copilot mascot"
- **Title:** Foundry Agentic Development Winter Bootcamp registration
- **Description**, in four lines, with the third line in bold:

  ```text
  Build, evaluate and operate AI agents with Microsoft Foundry. Six practical sessions across the agent lifecycle, from a working agent to deployment, operations and organisational governance.
  Winter 2026/27 · Online · Free · Six one-hour sessions
  All times are Central European Time (CET, UTC+1).
  Every date runs the same six sessions, so pick as many sessions as you like, on as many dates as you like. Dates are preliminary and subject to confirmation. Registration takes about two minutes.
  ```

## Questions

Questions 1 to 4, 11 and 12 are required, and the text and email answers are single line. Questions 5 to 10 are one optional choice question per session, with multiple answers on. Each title is the session name, as on the site, and each subtitle starts with the session's time in bold. The options are the six dates: `Friday 4 December`, `Friday 11 December`, `Friday 18 December`, `Friday 8 January`, `Friday 15 January`, `Friday 22 January`. Every date is before European summer time starts on 28 March 2027, so all times are CET.

1. **Participant Full name**: text. Subtitle: "Enter your first and last name so we can distinguish your registration and associate it with your company email address."
2. **Company or organisation**: text.
3. **Company email address**: email. Subtitle: "We send your formal event invitation to this address."
4. **Re-enter company email address**: email. Subtitle: "Enter the same address again to confirm it."
5. **Build it - Foundations**: session dates. Subtitle: "09:00–10:00 CET", then on a new line "Tick each date you want to attend, or leave it blank to skip this session."
6. **Build it - Advanced patterns**: session dates. Subtitle: "10:00–11:00 CET".
7. **Evaluate it**: session dates. Subtitle: "11:00–12:00 CET".
8. **Deploy it**: session dates. Subtitle: "12:30–13:30 CET".
9. **Operate and integrate it**: session dates. Subtitle: "13:30–14:30 CET".
10. **Govern it**: session dates. Subtitle: "14:30–15:30 CET".
11. **Development environment**: choice, one answer, with the options "I will use my own machine" and "I need a cloud development environment". Subtitle: "Use your own machine if you can install tools locally. Setup details follow with the prerequisites. Cloud places are limited, so choosing cloud records your request but does not guarantee a place."
12. **Data consent**: one checkbox: "I consent to Microsoft using my name, company, company email, session choices and environment preference to administer the bootcamp, send the event invitation, provision access, communicate with me and improve the programme. Registration data is deleted after the administration period."

## Settings

- Who can respond: Anyone can respond.
- Hide "Submit another response": on.
- Receipt of responses: on, so registrants can print a copy of their answers.
- Save and edit responses: off.
- Thank-you message: "Thank you for registering! You will receive a formal invitation with more details closer to the date of the bootcamp. To change your registration, contact the Microsoft contact who invited you."

## Differences from the on-site form

- The form also asks for the participant's full name, so its consent wording adds "my name". Otherwise it matches the current wording in `api/consent.json` (version `2026-10-29`), which the on-site form uses. If that wording changes, update the form too.
- Forms cannot check that the two email addresses match. Compare them when processing responses.
- Forms does not require at least one session. Follow up on responses with no dates ticked.

## Embedding

The site adds `embed=true` to the link. Forms renders the form inline only in frames at least 320px wide and about 320px tall, and shows a "Fill in the form" launcher in smaller ones. On screens 420px wide or less, the site's frames drop their padding, so the form renders inline on phones from 360px wide (`src/registration/MicrosoftFormRegistration.module.css`).
