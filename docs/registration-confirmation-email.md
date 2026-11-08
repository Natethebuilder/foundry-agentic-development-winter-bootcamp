# Registration confirmation email

**Status: not enabled yet.** The email needs send access to the bootcamp's shared mailbox. Until it is enabled, the website tells registrants that their registration was received and that a formal invitation will follow by email.

When registration is open (`"registration": 1` in `api/site-state.json`), every new registrant should receive a short confirmation email. In every other state the API refuses submissions, so no email is sent.

The email is sent by the shared Power Automate flow `Agentic Winter Bootcamps Registration Upsert`, not by the website. The flow already receives the confirmed company email and has a Microsoft 365 connection, so no new secrets, app registrations or mail services are needed, and the API-to-flow contract does not change.

## Before you start

Ask the owner of the bootcamp mailbox, or an Exchange admin, to grant you **Send As** permission on it. If the bootcamp address is a Microsoft 365 group rather than a shared mailbox, ask for Send As on the group. Do not send from a personal mailbox.

## Add it to the flow

In the Foundry branch of the flow (the **Route foundry** condition, where `eventId` equals `foundry-agentic-development-winter-bootcamp`):

1. Directly under **Foundry response**, add a **Condition** and rename it `New foundry registration`. Because it comes after the response, an email failure can never change the `202` the API receives.
2. Set the condition to the expression `actions('Create_foundry_registration')?['status']` **is equal to** `Succeeded`. This is only true when a new row was created, because the create step is skipped on every other path (`updated`, `unchanged` and `email-mismatch`). If the create step has a different name, use that name with spaces replaced by underscores.
3. In the condition's **True** branch, add **Office 365 Outlook → Send an email from a shared mailbox (V2)**. Set **Original Mailbox Address** to the bootcamp mailbox.
4. Set **To** to the `companyEmail` value from the trigger body (expression `triggerBody()?['companyEmail']`).
5. Set **Subject** and **Body** from the template below. Switch the body editor to code view (`</>`) before pasting the HTML.
6. Set **Importance** to `Normal`. Leave CC and BCC empty.
7. In the email step's **Settings**, turn on **Secure inputs** and **Secure outputs**, like the other steps that handle registration data.
8. Save. Then reload the designer page and check that `New foundry registration` and the email step are still under **Foundry response** before you test.

Do **not** add the email to the update path, the email-mismatch path or the "email already registered" (`unchanged`) path:

- The company email is not verified (it is typed twice, not confirmed by link). Sending only when a row is created means each address can receive at most one confirmation per event, so the form cannot be used to repeatedly email someone else.
- On the `unchanged` path nothing is saved, and the API deliberately gives the browser the same `received` answer as for a new registration. Sending an email there would reveal that the address was already registered.

## Template

**Subject**

```text
Thank you for registering for the Foundry Agentic Development Winter Bootcamp
```

**Body (HTML)**

```html
<div style="margin:0;padding:24px;background:#07061a;font-family:'Segoe UI',Arial,sans-serif;color:#f1f0ff;">
  <div style="max-width:560px;margin:0 auto;padding:32px;border-radius:18px;background:#0f0c29;border:1px solid #29255a;">
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#b6b1ff;">Foundry Agentic Development</p>
    <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#f6f5ff;">Winter Bootcamp</h1>
    <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">Thank you for registering!</p>
    <p style="margin:0 0 22px;font-size:16px;line-height:1.6;">You will receive a formal invitation with more details closer to the date of the bootcamp.</p>
    <a href="https://aka.ms/FoundryBootcamp" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#8b6cff;color:#ffffff;font-weight:700;text-decoration:none;">View the programme</a>
    <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#a7a3cd;">You received this email because this address was used to register for the bootcamp. If that wasn't you, you can ignore this email.</p>
  </div>
</div>
```

`https://aka.ms/FoundryBootcamp` currently redirects to the deck (`#/deck`). Point it at the website root if registrants should land on the website instead.

**Plain-text version** (for previews or a text-only alternative)

```text
Thank you for registering!

You will receive a formal invitation with more details closer to the date of the bootcamp.

Programme: https://aka.ms/FoundryBootcamp

You received this email because this address was used to register for the Foundry Agentic Development Winter Bootcamp. If that wasn't you, you can ignore this email.
```

## Verify

Test only with explicit approval, because each test creates a SharePoint row and sends a real email.

1. Submit a new registration with a mailbox you control: one row is created and one email arrives from the shared mailbox.
2. Submit again from the same browser with different sessions: the row updates and **no** second email arrives.
3. Submit the same email from another browser: the site shows the same "received" message as for a new registration, nothing is saved and **no** email arrives.
4. Submit a different email from the first browser: the API returns `409`, nothing is saved and **no** email arrives.
5. Check the flow run history: the email step's inputs and outputs are redacted.
6. Switch `api/site-state.json` to `"registration": 2` or `3` in a test deployment: the API returns `403` and the flow is never called.
