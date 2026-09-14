# Automated Birthday Mails Setup

This guide explains how to hook up the `send_birthday_emails.js` script to an automated Cron Job once the client provides their official email credentials.

## 1. Get Email Provider Credentials
Ask the client to sign up for [Resend](https://resend.com) or [SendGrid](https://sendgrid.com) and provide the API key. 

## 2. Update the Script
In `scripts/send_birthday_emails.js`, replace the mock `sendEmail` function with the actual API SDK call:

```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
    await resend.emails.send({
        from: 'Prudentia Administration <admin@prudentiacollege.edu>',
        to: [to],
        subject: subject,
        html: html
    });
};
```

## 3. Deploy as a Cron Job
You have a few options to automate this script to run every day at 8:00 AM:

### Option A: Vercel Cron
If hosting on Vercel, move the script into an API route `api/cron-birthdays.js` and add a `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron-birthdays",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Option B: Supabase Edge Functions + pg_cron
Create a Supabase Edge Function containing the logic, and use the Supabase dashboard to schedule it to trigger daily.
