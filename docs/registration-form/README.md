# Registration form

This bootcamp's Microsoft Form takes registrations in registration state `4`. The site embeds it from `registrationFormUrl` in `site-state.json` (see [Site states](../../README.md#site-states)). This page records the form so it can be rebuilt. If the schedule or the reasons for collecting registrations change, update the form too.

- **Link:** <https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRxdEa3AwZX5OnfloSBL3H3tURUEzRjMwRFk0QlpOWUpDN0Q0Nzc1WVdYUi4u>
- **Responses:** stay with the form owner in Microsoft Forms and its Excel workbook, and are deleted 30 days after the final session (see [Data retention and deletion](#data-retention-and-deletion)).

## Design

- **Theme colour:** `#4f37d6`
- **Background image:** [background.png](background.png) (1920×1080)
- **Header image:** [tile.png](tile.png) (1280×720), alt text "Foundry Agentic Development Winter Bootcamp logo with the GitHub Copilot mascot"
- **Title:** Foundry Agentic Development Winter Bootcamp registration
- **Description:**

  ```text
  Please fill in the form to register to the event. Microsoft will use the information provided to administer the bootcamp, send the event invitation, provision access and communicate event information.
  Please read the Microsoft Privacy Statement: https://aka.ms/privacy

  Build, evaluate and operate AI agents with Microsoft Foundry. Six practical sessions across the agent lifecycle, from a working agent to deployment, operations and organisational governance.
  Winter 2026/27 · Online · Free · Six one-hour sessions

  All times are Central European Time (CET, UTC+1).
  Every date runs the same six sessions. Choose one date per session, or select Not attending to skip it. Dates are preliminary and subject to confirmation. Registration takes about two minutes.

  More details can be found here: https://aka.ms/FoundryBootcamp
  ```

## Questions

All five questions are required, and the text answers are single line. Every date is before European summer time starts on 28 March 2027, so all times are CET.

1. **Company or organisation**: text.
2. **Company email address**: text, restricted to email addresses. Subtitle: "We send your formal event invitation to this address."
3. **Re-enter company email address**: text, restricted to email addresses. Subtitle: "Enter the same address again to confirm it."
4. **Which date would you like to attend each session?**: Likert, one row per session and one column per date, plus "Not attending". Subtitle: "Select one date per session. Choose “Not attending” to skip a session. All times are CET (UTC+1)." The rows are the session names, as on the site, with their times:
   - Session 1: Build it - Foundations (09:00–10:00)
   - Session 2: Build it - Advanced patterns (10:00–11:00)
   - Session 3: Evaluate it (11:00–12:00)
   - Session 4: Deploy it (12:30–13:30)
   - Session 5: Operate and integrate it (13:30–14:30)
   - Session 6: Govern it (14:30–15:30)
5. **Development environment**: choice, one answer, with the options "I will install the tools locally" and "I need a cloud development environment". Subtitle: "Use your own machine if you can install tools locally. Setup details follow with the prerequisites. Cloud places are limited, so choosing cloud records your request but does not guarantee a place."

## Settings

- Who can respond: Anyone can respond.
- Hide "Submit another response": on.
- Receipt of responses: on, so registrants can print a copy of their answers.
- Save and edit responses: off.
- Thank-you message: "Thank you for registering! You will receive a formal invitation with more details closer to the date of the bootcamp. To change your registration, contact the Microsoft contact who invited you."

## Privacy

- **Purpose and Privacy Statement:** the description's first lines say why Microsoft collects the answers and link the Microsoft Privacy Statement. The site adds its own notice and a **Privacy** link wherever it embeds or starts the form (see [Privacy](../../README.md#privacy)).
- **Required questions:** Forms marks each required question with an asterisk and says so at the top of the form. Each question is needed to register and invite: company, company email (twice, to confirm it), session dates and development environment. The form asks for no name.
- **No consent questions:** the form asks for no marketing permissions and shares answers with no third party. Adding either would need its own optional consent question.
- **To change in Forms** (the site cannot edit the form):
  1. Put the Privacy Statement link right above **Submit**. Forms has no text after the last question, so end the subtitle of **Development environment** with "Privacy: https://go.microsoft.com/fwlink/?LinkId=521839", and use the same link in the description instead of https://aka.ms/privacy.
  2. Tell registrants how long responses are kept: add "Responses are deleted 30 days after the final session." to the description, after the Privacy Statement line.

## Processing responses

- Forms cannot check that the two email addresses match. Compare them when processing responses.
- Forms does not require at least one session: a registrant can choose "Not attending" for all six. Follow up on such responses.

## Data retention and deletion

All registration data is deleted 30 days after the final session. The final session is on Friday 22 January 2027, so the deletion date is Sunday 21 February 2027. The dates are preliminary (`BOOTCAMP.datesConfirmed` in `src/content.js`): if the final session moves, the deletion date moves with it.

On that date, delete:

- every response in Microsoft Forms (**Responses** > **More options** > **Delete all responses**);
- the form's Excel workbook, separately, since it can keep responses deleted in Forms;
- every export or copy of the responses, such as downloaded workbooks, attendee or invitation lists, and emails or files that contain them;
- any registrations still in the SharePoint List that the retired on-site registration form wrote to, and the run history of the flow that wrote them.

## Embedding

The site adds `embed=true` to the link. Forms renders the form inline only in frames at least 320px wide and about 320px tall, and shows a "Fill in the form" launcher in smaller ones. On screens 420px wide or less, the site's frames drop their padding, so the form renders inline on phones from 360px wide (`src/registration/MicrosoftFormRegistration.module.css`). The site's content security policy, added at build by `vite.config.js`, allows frames only from `forms.office.com`, `forms.cloud.microsoft` and `forms.microsoft.com`.
