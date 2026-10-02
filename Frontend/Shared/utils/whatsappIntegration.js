/* © 2026 JSM VALOR. All Rights Reserved. */

/**
 * WhatsApp Integration Utility
 * Configured for Meta's Official WhatsApp Cloud API (Free Tier: 1,000 service conversations/month)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create an app in the Meta for Developers portal.
 * 2. Add the WhatsApp product to your app.
 * 3. Add a payment method (you won't be charged for the first 1,000 service conversations per month).
 * 4. Get your Permanent Access Token, Phone Number ID, and Business Account ID.
 * 5. Add them to your .env file:
 *    VITE_WHATSAPP_TOKEN=your_permanent_token
 *    VITE_WHATSAPP_PHONE_ID=your_phone_number_id
 */

import { supabase } from '../lib/supabase/supabaseClient';

export const notifyBatchWhatsApp = async (whatsappGroupId, message) => {
    if (!whatsappGroupId) {
        console.warn("WhatsApp Integration: No WhatsApp Group ID provided for this batch.");
        return { success: false, error: "No Group ID" };
    }

    try {
        const { error } = await supabase.from('whatsapp_queue').insert({
            phone: whatsappGroupId,
            message: message,
            status: 'PENDING'
        });
        
        if (error) throw error;
        return { success: true, queued: true };
    } catch (error) {
        console.error("WhatsApp Integration Error:", error);
        return { success: false, error: error.message };
    }
};
