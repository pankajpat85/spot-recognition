# Spot Recognition — User Guide

## What Is Spot Recognition?

Spot Recognition is a tool for celebrating teammates. When someone goes above and beyond, you fill out a short form, choose a few achievement badges, and the app generates a polished "Wall of Fame" image and emails it directly to the recipient — and everyone in the recognition chain.

---

## Getting Started

### 1. Create Your Organisation Account

Go to the app and click **Get Started** or **Register**.

You will be asked for:
- **Your name** — how you appear in recognitions you send
- **Your email address** — your login credential
- **A password**
- **Your organisation name** — e.g. "Acme Corp" or "The Marketing Team"

When you register, you are automatically made the **admin** of your new organisation. You can invite colleagues afterwards.

> If your organisation is already set up and a colleague invited you, follow the invite link they sent — you do not need to register again.

### 2. Log In

Visit the app and enter your email and password. If your organisation uses Google sign-in, click **Continue with Google** instead.

If you forget your password, click **Forgot password?** on the login page. You will receive a reset link by email (valid for 1 hour).

---

## Sending a Spot Recognition

Click **Send Spot Recognition** from the dashboard or the sidebar.

The form has four sections:

### Recognition Details

**Spot Winner(s)**
Start typing a name or email. The app searches your organisation's directory and shows matches. Select the person from the dropdown.

If the person is not in the system yet (e.g. a contractor or new starter), type their name and email directly — the app will accept free-text participants.

You can add more than one winner to the same recognition.

**Winner Photo**
Upload a photo of the winner. If you selected a user with a profile photo, their photo is pre-filled automatically. You can change it by uploading a different one.

**Recognition Description**
Write a few sentences about what the person did and why it deserves recognition. This text appears on the Wall of Fame image and in the email.

**Recognition Given By**
Add yourself or the person on whose behalf you are sending the recognition. Works the same as the winner field — search for a user or type a name and email.

### Achievement Badges

Select one or more badges that describe the achievement. Available badges include:

| Badge | When to use |
|---|---|
| **Brain Wave** | A clever idea or creative solution |
| **Calmer of Storms** | Kept cool and resolved a difficult situation |
| **Cool Cucumber** | Stayed calm under pressure |
| **High Five** | Great teamwork or collaboration |
| **Juggler** | Managed multiple priorities at once |
| **Out of Box** | Innovative thinking outside normal boundaries |
| **Rockstar** | Outstanding overall performance |

You can pick as many badges as apply.

### Recognition Period

Set a **Start Date** and **End Date** that describes the period the achievement covers (e.g. a sprint, a quarter, a project).

### Wall of Fame Background

Choose a background image for the Wall of Fame card. Your organisation may have a custom background; otherwise the default is used. You can also upload a custom one in Organisation Settings.

### Submitting

Click **Send Spot Recognition**. The app will:

1. Save the recognition record
2. Generate the Wall of Fame image
3. Upload it
4. Email it to the winner(s), with the sender CC'd

When it is done, you are taken to the History page.

---

## Viewing History

Click **History** in the sidebar. You will see a list of all recognitions your organisation has created.

You can filter by:
- **Date range** (start / end)
- **Badge** type
- **Winner name** (search)

Each row shows the winner, the recognition period, the badges, and whether the email has been sent. Sent recognitions are marked with a checkmark.

---

## Dashboard

The dashboard gives you a quick summary:

- **Total Spots Sent** — all recognitions that have been emailed since your org was created
- **Sent This Month** — recognitions sent in the current calendar month
- **Recent Spots** — the last five recognitions created by anyone in your org

From here you can navigate quickly to sending a new recognition, managing users, or viewing history.

---

## Managing Users (Admin only)

Go to **Users** in the sidebar (only visible to admins).

### Adding a user manually

Click **Add User**. Enter the person's name and email. Optionally upload a photo. The user will be able to log in by registering with that email address.

### Importing users from a spreadsheet

Click **Import CSV**. Upload a CSV file with at least two columns: `name` and `email`. The app will:

- Create new users for emails it has not seen before
- Update the name for existing users
- Skip rows with missing name or email

This is the quickest way to add your whole team at once.

### Editing or removing a user

Click the edit icon next to a user to update their name, email, or photo. Click delete to remove them. Removed users no longer appear in search results or can log in, but their historical recognitions remain intact.

---

## Organisation Settings (Admin only)

Go to **Settings** in the sidebar.

### General

- **Organisation Name** — displayed on the Wall of Fame image and in emails
- **From Name** — the display name in outgoing recognition emails (e.g. "Acme Recognition")
- **From Email** — the reply-to / sender address for recognition emails (e.g. recognition@acme.com). Requires your own SMTP to be configured (see below).

### SMTP / Email

By default, recognitions are sent from the platform's email system. If you want them to come from your own email domain (recommended for a professional look), configure your SMTP details here.

You will need:
- **SMTP Host** — e.g. `smtp.gmail.com` or your company's mail server
- **Port** — typically `587` (STARTTLS) or `465` (SSL)
- **TLS/SSL** — check this if using port 465
- **Username** — your SMTP login (usually the sending email address)
- **Password** — your SMTP password or app-specific password

After saving, click **Send Test Email** to verify the configuration works.

> SMTP credentials are encrypted before being stored.

### Backgrounds

Upload custom background images for the Wall of Fame card. These are available to everyone in your organisation when sending a recognition.

- Click the **+** tile to upload a new background (JPEG, PNG, etc.)
- Hover over a background thumbnail to see the delete button
- The **Default** background cannot be deleted

---

## Plan Limits

| Plan | Monthly Spot Limit | Custom SMTP | Custom Backgrounds |
|---|---|---|---|
| Free | 10 per month | — | — |
| Pro | Unlimited | ✓ | ✓ |
| Enterprise | Unlimited | ✓ | ✓ |

When you hit the Free plan limit you will see an error message asking you to upgrade. The counter resets at the start of each calendar month.

---

## Legacy / Offline Tool

If you need a zero-login, offline version (useful for one-off use or if you have no internet), open the file at `docs/index.html` in any browser — no installation required.

### How to use it

1. **Add entries** using the form on the left:
   - Upload a winner photo
   - Enter the winner's name and who gave the recognition
   - Write the recognition text
   - Select badges
   - Click **Add Entry**

2. **Manage entries** in the table on the right:
   - Click the **pencil** icon to edit an entry (photo is preserved if you do not upload a new one)
   - Click the **copy** icon to duplicate an entry
   - Click the **bin** icon to delete (you will be asked to confirm)
   - Click a photo thumbnail to see it full-size

3. **Generate the Wall of Fame image**:
   - Set a **From** and **To** date at the bottom
   - Click **Generate Image**
   - A preview of the image appears in a modal
   - Click **Save Image** to download the PNG to your computer

> All data in the offline tool is lost when you close or refresh the page — there is no save/load feature. Build the whole image in one session.

---

## Tips for Great Recognitions

- **Be specific.** "Jane helped unblock three teams by staying late to fix the API gateway" lands better than "Jane did great work."
- **Use multiple badges** when the achievement genuinely spans more than one dimension.
- **Upload a good photo.** The Wall of Fame image looks best with a clear, well-lit face photo.
- **Set a meaningful date range.** Match it to the project, sprint, or time period the achievement happened — it makes the recognition feel grounded.
- **Copy the sender field accurately.** The sender is CC'd on the email, so they see the recognition go out.

---

## Frequently Asked Questions

**Can I edit a recognition after sending it?**
The sent email cannot be recalled, but you can delete the record in History and create a new one if there was an error.

**The email ended up in spam. What should I do?**
If you are on the Free plan, recognitions come from the shared platform email. Ask your admin to configure a custom SMTP (Settings → SMTP) so emails come from your company domain, which improves deliverability significantly.

**Can I add someone who is not in our user directory?**
Yes. On the recognition form, simply type the person's name and email in the winner or sender field without selecting from the dropdown. The app will accept free-text participants and create a minimal record for them.

**How do I add more users to my organisation?**
Admins can add users one at a time from the Users page, or upload a CSV to import many at once.

**The Wall of Fame image looks blurry.**
The image is generated at 2× resolution. If you are saving from the offline tool (`docs/index.html`), try using a larger browser window before generating — the output reflects the rendered size.

**Can I change the badges available?**
Contact your administrator. On the SaaS platform, badge changes require a code update. On the offline tool, an admin can add a badge PNG to `docs/assets/images/` and add a matching option in `docs/index.html` — no build step needed.

**How long are password reset links valid?**
One hour. If the link has expired, go back to the Forgot Password page and request a new one.

**What happens when I delete a user?**
The user is soft-deleted — they cannot log in and do not appear in search, but their historical recognitions are preserved so the history remains complete.
