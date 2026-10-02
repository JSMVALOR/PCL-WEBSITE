/* © 2026 JSM VALOR. All Rights Reserved. */
import { HTML_EMAIL_TEMPLATES } from './emailtemplate';

export const EMAIL_TEMPLATES = {
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
};

export const sendSystemEmail = async (templateKey, params) => {
    try {
        const templateBuilder = EMAIL_TEMPLATES[templateKey];
        if (!templateBuilder) {
            throw new Error(`Invalid email template key: ${templateKey}`);
        }

        const { subject, message_body } = templateBuilder(params);

        // Vercel Serverless Function Endpoint
        const emailEndpoint = '/api/send-email';

        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_email: import.meta.env.VITE_EMAIL_OVERRIDE || params.to_email,
                subject: subject,
                message_body: message_body,
                attachments: params.attachments ? params.attachments : (params.attachment ? [{ filename: params.attachment_name || "Document.pdf", content: params.attachment, encoding: "base64" }] : undefined)
            }) });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error(response.status === 504 ? "Email gateway timeout. The server is taking too long." : "Email server returned an invalid response.");
        }
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to dispatch email via Vercel Serverless Engine.');
        }

        return true;
    } catch (error) {
        console.error("Email Engine Error:", error);
        throw error;
    }
};


export const sendSystemWhatsApp = async (to_phone, message) => {
    try {
        const endpoint = '/api/whatsapp/send';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_phone, message }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'WhatsApp dispatch failed.');
        return true;
    } catch (error) {
        console.error("WhatsApp Engine Error:", error);
        throw error;
    }
};

export const createWhatsAppGroup = async (group_name, participants) => {
    try {
        const endpoint = '/api/whatsapp/group';
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
