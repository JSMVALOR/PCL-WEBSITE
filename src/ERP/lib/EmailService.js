/* © 2026 JSM VALOR. All Rights Reserved. */
import { HTML_EMAIL_TEMPLATES } from './emailtemplate';

export const EMAIL_TEMPLATES = {

    PARENT_LOGIN_OTP: (params) => ({
        subject: `Your Parent Portal Verification Code`,
        message_body: HTML_EMAIL_TEMPLATES.PARENT_LOGIN_OTP(params) }),

    PARENT_ABSENT_ALERT: (params) => ({
        subject: `[ATTENDANCE ALERT] ${params.student_name} marked absent`,
        message_body: HTML_EMAIL_TEMPLATES.PARENT_ABSENT_ALERT(params) }),

    ERP_LOGIN_OTP: (params) => ({
        subject: `Your ERP Login Passcode`,
        message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params) }),
    APPLICATION_RECEIVED: (params) => ({
        subject: `Application Received - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.APPLICATION_RECEIVED(params) }),
    TICKET_REPLY: (params) => ({
        subject: `Update on Ticket #${params.ticket_id} - Prudentia`,
        message_body: HTML_EMAIL_TEMPLATES.TICKET_REPLY(params) }),
    SUPPORT_ENQUIRY: (params) => ({
        subject: `We Received Your Enquiry - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.SUPPORT_ENQUIRY(params) }),
    ONBOARDING: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS ? HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS(params) : `Welcome to the JSM Academic Infrastructure...\n\nOfficial ID: ${params.erp_id}\nTemporary Password: ${params.password}` }),
    PAYROLL_DISBURSAL: (params) => ({
        subject: `Salary Disbursal - ${params.month} ${params.year}`,
        message_body: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; letter-spacing: 2px; font-weight: 800; font-size: 24px; margin: 0;">PRUDENTIA</h1>
                    <p style="color: #b59c72; letter-spacing: 4px; font-size: 10px; text-transform: uppercase; margin-top: 5px; font-weight: bold;">College of Law</p>
                </div>
                
                <h2 style="color: #111; font-size: 18px; border-bottom: 2px solid #b59c72; padding-bottom: 10px;">Official Payslip - ${params.month} ${params.year}</h2>
                <p style="color: #333; font-size: 14px; line-height: 1.6;">Dear <strong>${params.faculty_name}</strong>,</p>
                <p style="color: #333; font-size: 14px; line-height: 1.6;">Your salary for the month of <strong>${params.month} ${params.year}</strong> has been successfully processed and disbursed via <strong>${params.payment_mode}</strong>.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #b59c72;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Net Disbursal Amount</p>
                    <p style="margin: 0; font-size: 24px; color: #1a1a1a; font-weight: 800;">₹ ${Number(params.final_net_pay).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                </div>

                <p style="color: #333; font-size: 14px; line-height: 1.6;">Please find attached your official, system-generated payslip. For your security, this document is mathematically encrypted. <strong>The password to open this file is your official ERP ID (${params.erp_id}).</strong></p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #888; text-align: center;">
                    <p style="margin: 0 0 5px 0;">This is an automated administrative email from the PCL ERP. Do not reply.</p>
                    <p style="margin: 0;">© 2026 Prudentia College of Law. All rights reserved.</p>
                </div>
            </div>
        `
    }),
    ASSIGNMENT_PUBLISHED: (params) => ({
        subject: `New Assignment Published: ${params.title}`,
        message_body: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #111; letter-spacing: 1px;">NEW ACADEMIC ASSIGNMENT</h2>
                <p><strong>Subject:</strong> ${params.subject_name}</p>
                <p><strong>Title:</strong> ${params.title}</p>
                <p><strong>Deadline:</strong> ${new Date(params.deadline).toLocaleString()}</p>
                <p><strong>Mode:</strong> ${params.submission_mode === 'URL_ONLY' ? 'Google Drive Link Required' : 'Physical Offline Submission'}</p>
                <br/>
                <p style="font-size: 12px; color: #888;">Log in to the Student Portal to view full details and submit.</p>
            </div>
        `
    }) };

export const sendSystemEmail = async (templateKey, params) => {
    try {
        const templateBuilder = EMAIL_TEMPLATES[templateKey];
        if (!templateBuilder) {
            throw new Error(`Invalid email template key: ${templateKey}`);
        }

        const { subject, message_body } = templateBuilder(params);

        // Vercel Serverless Function Endpoint
        const emailEndpoint = (import.meta.env.VITE_SITE_URL || window.location.origin) + '/api/send-email';

        const response = await fetch(emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_email: 'marvelswaroop118@gmail.com', // [TESTING OVERRIDE] Forces all emails to go here
                subject: subject,
                message_body: message_body,
                attachments: params.attachment ? [{
                    filename: params.attachment_name || 'Document.pdf',
                    content: params.attachment,
                    encoding: 'base64'
                }] : undefined
            }) });

        const result = await response.json();
        
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
