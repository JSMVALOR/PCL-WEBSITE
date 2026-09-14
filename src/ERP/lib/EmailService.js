/* © 2026 JSM VALOR. All Rights Reserved. */
import { HTML_EMAIL_TEMPLATES } from './emailtemplate';

export const EMAIL_TEMPLATES = {
    ERP_LOGIN_OTP: (params) => ({
        subject: `Your ERP Login Passcode`,
        message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params),
    }),
    APPLICATION_RECEIVED: (params) => ({
        subject: `Application Received - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.APPLICATION_RECEIVED(params),
    }),
    TICKET_REPLY: (params) => ({
        subject: `Update on Ticket #${params.ticket_id} - Prudentia`,
        message_body: HTML_EMAIL_TEMPLATES.TICKET_REPLY(params),
    }),
    SUPPORT_ENQUIRY: (params) => ({
        subject: `We Received Your Enquiry - Ticket #${params.ticket_id}`,
        message_body: HTML_EMAIL_TEMPLATES.SUPPORT_ENQUIRY(params),
    }),
    ONBOARDING: (params) => ({
        subject: `Welcome to PCL ERP - Your Official Credentials`,
        message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS ? HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS(params) : `Welcome to the JSM Academic Infrastructure...\n\nOfficial ID: ${params.erp_id}\nTemporary Password: ${params.password}`,
    }),
};

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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to_email: params.to_email,
                subject: subject,
                message_body: message_body
            }),
        });

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
