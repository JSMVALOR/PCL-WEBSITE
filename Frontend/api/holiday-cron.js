/* © 2026 JSM VALOR. All Rights Reserved. */
/* 
 * Vercel Cron: Holiday Reminder & Wishes
 * 
 * This serverless function runs daily via Vercel Cron.
 * - At 6 PM IST (day before a holiday): sends REMINDER emails to all students & faculty
 * - At 8 AM IST (on the holiday): sends WISHES emails to all students & faculty
 * 
 * Cron schedule configured in vercel.json
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// ── Email builder (server-side version — matches the client buildEmailHtml) ──
function buildEmailHtml(title, content) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><style>
    body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
    .wrap{max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}
    .header{background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 24px;text-align:center;color:#ffffff}
    .header h1{margin:0;font-size:20px;font-weight:700;letter-spacing:-0.025em}
    .body{padding:28px 24px;color:#1f2937;font-size:14px;line-height:1.7}
    .body p{margin:0 0 12px}
    .data-box{background:#f9fafb;border:1px solid #e5e7eb;border-left:4px solid #6366f1;border-radius:8px;padding:16px;margin:16px 0}
    .data-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6}
    .data-row:last-child{border:none}
    .data-label{color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
    .data-value{color:#1f2937;font-weight:600;text-align:right}
    .footer{background:#f9fafb;padding:20px 24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb}
    </style></head><body><div style="padding:20px 12px"><div class="wrap">
    <div class="header"><h1>${title}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">Prudentia College of Law — Powered by JSM VALOR Infrastructure</div>
    </div></div></body></html>`;
}

function buildReminderHtml(params) {
    return buildEmailHtml(
        `Reminder: ${params.holiday_name} — College Closed Tomorrow`,
        `<p>Dear ${params.name || 'Member'},</p>
        <p>This is a reminder that <strong>tomorrow, ${params.holiday_date}</strong>, is <strong>${params.holiday_name}</strong>.</p>
        <div class="data-box">
            <div class="data-row"><span class="data-label">Holiday</span><span class="data-value">${params.holiday_name}</span></div>
            <div class="data-row"><span class="data-label">Date</span><span class="data-value">${params.holiday_date}</span></div>
            <div class="data-row"><span class="data-label">Description</span><span class="data-value">${params.description || 'College will remain closed.'}</span></div>
        </div>
        <p>No classes or examinations will be held on this day. Regular academic activities will resume on the next working day.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">Please plan your submissions and assignments accordingly.</p>`
    );
}

function buildWishesHtml(params) {
    return buildEmailHtml(
        `Happy ${params.holiday_name}! 🎉`,
        `<p>Dear ${params.name || 'Member'},</p>
        <p>The Administration and Faculty of <strong>Prudentia College of Law</strong> wishes you a very Happy <strong>${params.holiday_name}</strong>!</p>
        ${params.description ? `<p style="color: #6b7280; font-style: italic; margin: 16px 0;">"${params.description}"</p>` : ''}
        <p>We hope you have a wonderful day with your family and loved ones. Stay safe and enjoy the festivities.</p>
        <p style="margin-top: 20px;">Warm Regards,<br/><strong>Prudentia College of Law</strong></p>`
    );
}

// ── Format date to IST YYYY-MM-DD ──
function getISTDate(offsetDays = 0) {
    const now = new Date();
    // IST = UTC + 5:30
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    ist.setDate(ist.getDate() + offsetDays);
    return ist.toISOString().split('T')[0];
}

function formatDateNice(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

// ── Get IST hour (0-23) ──
function getISTHour() {
    const now = new Date();
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return ist.getUTCHours();
}

// ── Send batch emails via nodemailer ──
async function sendBatchEmails(recipients, subject, htmlBuilder, holidayParams) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
    });

    let sent = 0;
    let failed = 0;

    for (const person of recipients) {
        try {
            const html = htmlBuilder({ ...holidayParams, name: person.full_name || person.name || 'Member' });
            await transporter.sendMail({
                from: `Prudentia College of Law <${process.env.EMAIL_USER}>`,
                to: person.email,
                subject: subject,
                html: html,
            });
            sent++;
            // Small delay to avoid Gmail rate limits
            if (sent % 20 === 0) await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
            console.error(`Failed to send to ${person.email}:`, err.message);
            failed++;
        }
    }

    transporter.close();
    return { sent, failed };
}

export default async function handler(req, res) {
    // Verify cron secret (Vercel sets this automatically for cron jobs)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Also allow manual trigger from admin with a different key
        if (req.query?.key !== process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const todayIST = getISTDate(0);
        const tomorrowIST = getISTDate(1);
        const istHour = getISTHour();

        console.log(`[Holiday Cron] Running at IST hour ${istHour}. Today: ${todayIST}, Tomorrow: ${tomorrowIST}`);

        // Determine what to send based on IST hour:
        // - Before 12 PM IST: send WISHES for today's holidays
        // - After 12 PM IST: send REMINDERS for tomorrow's holidays
        let mode, targetDate;
        if (istHour < 12) {
            mode = 'wishes';
            targetDate = todayIST;
        } else {
            mode = 'reminder';
            targetDate = tomorrowIST;
        }

        // Check for holidays on the target date
        const { data: holidays, error: hErr } = await supabase
            .from('academic_events')
            .select('title, start_date, description')
            .eq('event_type', 'Holiday')
            .eq('is_active', true)
            .eq('start_date', targetDate);

        if (hErr) throw hErr;

        if (!holidays || holidays.length === 0) {
            console.log(`[Holiday Cron] No holidays on ${targetDate}. Nothing to send.`);
            return res.status(200).json({ message: `No holidays on ${targetDate}`, mode, sent: 0 });
        }

        // Use the first holiday (or combine if multiple on same day)
        const holiday = holidays[0];
        const holidayName = holidays.length > 1
            ? holidays.map(h => h.title).join(' & ')
            : holiday.title;
        const holidayDesc = holidays.length > 1
            ? holidays.map(h => h.description).filter(Boolean).join('. ')
            : holiday.description;

        // Fetch all active students and faculty with emails
        const { data: students } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('role', 'student')
            .eq('status', 'active')
            .not('email', 'is', null);

        const { data: faculty } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('role', 'faculty')
            .eq('status', 'active')
            .not('email', 'is', null);

        const recipients = [
            ...(students || []),
            ...(faculty || [])
        ].filter(r => r.email && r.email.includes('@'));

        if (recipients.length === 0) {
            console.log(`[Holiday Cron] No recipients found.`);
            return res.status(200).json({ message: 'No recipients found', mode, sent: 0 });
        }

        const holidayParams = {
            holiday_name: holidayName,
            holiday_date: formatDateNice(targetDate),
            description: holidayDesc,
        };

        let result;
        if (mode === 'reminder') {
            result = await sendBatchEmails(
                recipients,
                `Reminder: ${holidayName} — College Closed Tomorrow`,
                buildReminderHtml,
                holidayParams
            );
        } else {
            result = await sendBatchEmails(
                recipients,
                `Happy ${holidayName}! 🎉 — Prudentia College of Law`,
                buildWishesHtml,
                holidayParams
            );
        }

        console.log(`[Holiday Cron] ${mode.toUpperCase()} — Sent: ${result.sent}, Failed: ${result.failed}`);

        return res.status(200).json({
            message: `Holiday ${mode} sent for ${holidayName}`,
            mode,
            holiday: holidayName,
            date: targetDate,
            recipients: recipients.length,
            sent: result.sent,
            failed: result.failed,
        });
    } catch (error) {
        console.error('[Holiday Cron] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
