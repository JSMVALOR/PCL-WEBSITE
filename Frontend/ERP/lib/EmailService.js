/* © 2026 JSM VALOR. All Rights Reserved. */
import { HTML_EMAIL_TEMPLATES } from './emailtemplate';

export const EMAIL_TEMPLATES = {
    BLOG_UPDATE: (params) => ({
        subject: `Update on Your Blog Submission: ${params.title}`,
        message_body: HTML_EMAIL_TEMPLATES.BLOG_UPDATE(params) }),
    GRIEVANCE_UPDATE: (params) => ({
        subject: `Update: Grievance marked as ${params.new_status}`,
        message_body: HTML_EMAIL_TEMPLATES.GRIEVANCE_UPDATE(params) }),

    MEETING_CALL: (params) => ({
        subject: `Mandatory Meeting - Disciplinary Committee`,
        message_body: HTML_EMAIL_TEMPLATES.MEETING_CALL(params) }),


    PARENT_LOGIN_OTP: (params) => ({
        subject: `Your Parent Portal Verification Code`,
        message_body: HTML_EMAIL_TEMPLATES.PARENT_LOGIN_OTP(params) }),

    PARENT_ABSENT_ALERT: (params) => ({
        subject: `[ATTENDANCE ALERT] ${params.student_name} marked absent`,
        message_body: HTML_EMAIL_TEMPLATES.PARENT_ABSENT_ALERT(params) }),

    ERP_LOGIN_OTP: (params) => ({
        subject: `Your ERP Login Passcode`,
        message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params) }),

    RECOVERY_OTP: (params) => ({
        subject: `Your Account Recovery OTP`,
        message_body: HTML_EMAIL_TEMPLATES.RECOVERY_OTP(params) }),

    PASSCODE_RESET: (params) => ({
        subject: `Your ERP Password has been Reset`,
        message_body: HTML_EMAIL_TEMPLATES.PASSCODE_RESET(params) }),
        
    
    APPLICATION_REJECTED: (params) => ({
        subject: `Update on Your Admission Application`,
        message_body: HTML_EMAIL_TEMPLATES.APPLICATION_REJECTED(params) }),

    APPLICATION_RECEIVED: (params) => ({
        subject: `Application Received - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.APPLICATION_RECEIVED(params) }),
        
    TICKET_REPLY: (params) => ({
        subject: `Update on Ticket #${params.ticket_id} - Prudentia`,
        message_body: HTML_EMAIL_TEMPLATES.TICKET_REPLY(params) }),
        
    SUPPORT_ENQUIRY: (params) => ({
        subject: `We Received Your Enquiry - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.SUPPORT_ENQUIRY(params) }),
        
        FIRST_CREDENTIALS: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS ? HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS(params) : '' }),
    ONBOARDING: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS ? HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS(params) : `Welcome to the JSM Academic Infrastructure...

Official ID: ${params.erp_id}
Temporary Password: ${params.password}` }),
        
    PAYROLL_DISBURSAL: (params) => ({
        subject: `Salary Disbursal - ${params.month} ${params.year}`,
        message_body: HTML_EMAIL_TEMPLATES.PAYROLL_DISBURSAL(params) }),
        
    ASSIGNMENT_PUBLISHED: (params) => ({
        subject: `New Assignment Published: ${params.title}`,
        message_body: HTML_EMAIL_TEMPLATES.ASSIGNMENT_PUBLISHED(params) }),
        
    LEAVE_APPLIED: (params) => ({
        subject: `Leave Application Submitted`,
        message_body: HTML_EMAIL_TEMPLATES.LEAVE_APPLIED(params) }),
        
    LEAVE_APPROVED: (params) => ({
        subject: `Leave Application Approved`,
        message_body: HTML_EMAIL_TEMPLATES.LEAVE_APPROVED(params) }),
        
    LEAVE_REJECTED: (params) => ({
        subject: `Leave Application Rejected`,
        message_body: HTML_EMAIL_TEMPLATES.LEAVE_REJECTED(params) }),
        
    HAPPY_BIRTHDAY: (params) => ({
        subject: `Happy Birthday from Prudentia College of Law!`,
        message_body: HTML_EMAIL_TEMPLATES.HAPPY_BIRTHDAY(params) }),
        
    DEBARMENT_NOTICE: (params) => ({
        subject: `CRITICAL: Attendance Debarment Notice`,
        message_body: HTML_EMAIL_TEMPLATES.DEBARMENT_NOTICE(params) }),
        
    SHORTAGE_WARNING: (params) => ({
        subject: `WARNING: Attendance Shortage`,
        message_body: HTML_EMAIL_TEMPLATES.SHORTAGE_WARNING(params) }),
    FEE_PAYMENT_RECEIPT: (params) => ({
        subject: `Fee Payment Receipt - ${params.fee_type}`,
        message_body: HTML_EMAIL_TEMPLATES.FEE_PAYMENT_RECEIPT(params) }),

    PLACEMENT_STATUS_UPDATE: (params) => ({
        subject: `Placement Update: ${params.company_name}`,
        message_body: HTML_EMAIL_TEMPLATES.PLACEMENT_STATUS_UPDATE(params) }),

    MENTOR_ASSIGNED: (params) => ({
        subject: `New Faculty Mentor Assigned`,
        message_body: HTML_EMAIL_TEMPLATES.MENTOR_ASSIGNED(params) }),

    CLINIC_ASSIGNMENT: (params) => ({
        subject: `Clinical Program Assignment: ${params.clinic_name}`,
        message_body: HTML_EMAIL_TEMPLATES.CLINIC_ASSIGNMENT(params) }),

    FEE_INVOICE_RAISED: (params) => ({
        subject: `New Fee Invoice Raised - ${params.invoice_title || 'Academic Fee'}`,
        message_body: HTML_EMAIL_TEMPLATES.FEE_INVOICE_RAISED(params) }),

    GENERAL_BROADCAST: (params) => ({
        subject: params.subject || `[${(params.priority || 'NOTICE').toUpperCase()}] ${params.title || 'Official Notice'}`,
        message_body: HTML_EMAIL_TEMPLATES.GENERAL_BROADCAST(params) }),

    ACCOUNT_LOCKED: (params) => ({
        subject: `Your ERP Account Has Been Suspended`,
        message_body: HTML_EMAIL_TEMPLATES.ACCOUNT_LOCKED(params) }),

    ACCOUNT_REACTIVATED: (params) => ({
        subject: `Your ERP Account Has Been Reactivated`,
        message_body: HTML_EMAIL_TEMPLATES.ACCOUNT_REACTIVATED(params) }),

    ERP_NEW_ACCOUNT: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: HTML_EMAIL_TEMPLATES.ERP_NEW_ACCOUNT(params) }),
};

export const sendSystemEmail = async (templateKey, params, _retryCount = 0) => {
    const MAX_RETRIES = 2;
    try {
        const templateBuilder = EMAIL_TEMPLATES[templateKey];
        if (!templateBuilder) {
            throw new Error(`Invalid email template key: ${templateKey}`);
        }

        const { subject, message_body } = templateBuilder(params);

        // Vercel Serverless Function Endpoint or Local Node.js Email Service
        const emailEndpoint = import.meta.env.DEV ? 'http://localhost:3001/api/send-email' : '/api/send-email';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout

        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_email: import.meta.env.VITE_EMAIL_OVERRIDE || params.to_email,
                subject: subject,
                message_body: message_body,
                attachments: params.attachments ? params.attachments : (params.attachment ? [{ filename: params.attachment_name || "Document.pdf", content: params.attachment, encoding: "base64" }] : undefined)
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            // Non-JSON response — server returned HTML error page (502/504 gateway)
            if (_retryCount < MAX_RETRIES) {
                console.warn(`[Email] Non-JSON response (HTTP ${response.status}), retrying (${_retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(r => setTimeout(r, 2000 * (_retryCount + 1)));
                return sendSystemEmail(templateKey, params, _retryCount + 1);
            }
            const statusHint = response.status === 504 ? "Email gateway timeout — Vercel serverless function exceeded time limit."
                             : response.status === 502 ? "Email gateway error — the mail server may be temporarily down."
                             : `Email server returned HTTP ${response.status}. Check Vercel function logs.`;
            throw new Error(statusHint);
        }
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to dispatch email via Vercel Serverless Engine.');
        }

        return true;
    } catch (error) {
        if (error.name === 'AbortError') {
            if (_retryCount < MAX_RETRIES) {
                console.warn(`[Email] Request timed out, retrying (${_retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(r => setTimeout(r, 2000 * (_retryCount + 1)));
                return sendSystemEmail(templateKey, params, _retryCount + 1);
            }
            throw new Error('Email request timed out after 25 seconds. The server is unresponsive.');
        }
        console.error("Email Engine Error:", error);
        throw error;
    }
};


const WA_ENGINE_URL = import.meta.env.DEV ? 'http://localhost:3005' : (import.meta.env.VITE_WHATSAPP_ENGINE_URL || 'http://localhost:3005');

export const sendSystemWhatsApp = async (to_phone, message, options = {}) => {
    const { template_id, variables, recipient_name } = options;
    try {
        const endpoint = `${WA_ENGINE_URL}/api/whatsapp/send`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_phone, message, template_id, variables, recipient_name }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'WhatsApp dispatch failed.');
        return true;
    } catch (error) {
        console.error("WhatsApp Engine Error:", error);
        // Fallback: queue directly to supabase if engine is unreachable
        try {
            const { supabase } = await import('../../Shared/lib/supabase/supabaseClient');
            await supabase.from('whatsapp_queue').insert({
                phone: to_phone,
                message: message,
                status: 'PENDING',
                recipient_name: recipient_name || null,
                template_id: template_id || null,
            });
            console.log("WhatsApp message queued via Supabase fallback.");
            return true;
        } catch (fallbackErr) {
            console.error("WhatsApp Supabase fallback also failed:", fallbackErr);
            throw error; // Throw original error
        }
    }
};

export const sendSystemWhatsAppBatch = async (messages) => {
    try {
        const endpoint = `${WA_ENGINE_URL}/api/whatsapp/send-batch`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'WhatsApp batch dispatch failed.');
        return result;
    } catch (error) {
        console.error("WhatsApp Engine Batch Error:", error);
        // Fallback: queue directly
        try {
            const { supabase } = await import('../../Shared/lib/supabase/supabaseClient');
            const items = messages.map(m => ({
                phone: m.to_phone,
                message: m.message || '',
                status: 'PENDING',
                recipient_name: m.recipient_name || null,
                template_id: m.template_id || null,
            })).filter(m => m.phone && m.message);
            if (items.length > 0) {
                await supabase.from('whatsapp_queue').insert(items);
            }
            return { success: true, queued: items.length };
        } catch (fallbackErr) {
            throw error;
        }
    }
};

export const createWhatsAppGroup = async (group_name, participants) => {
    try {
        const endpoint = `${WA_ENGINE_URL}/api/whatsapp/group`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_name, participants }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Group creation failed.');
        return result.group_id;
    } catch (error) {
        console.error("WhatsApp Engine Error:", error);
        throw error;
    }
};
