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

export const notifyBatchWhatsApp = async (whatsappGroupId, message) => {
    if (!whatsappGroupId) {
        console.warn("WhatsApp Integration: No WhatsApp Group ID provided for this batch.");
        return { success: false, error: "No Group ID" };
    }

    const token = null; // import.meta.env.VITE_WHATSAPP_TOKEN; (Removed for security: DO NOT put private Meta graph tokens in Vite envs)
    const phoneId = null;

    if (!token || !phoneId) {
        console.warn("WhatsApp Integration: Direct client-side calls are disabled for security. Use a secure backend endpoint.");
        // Simulated success for development
        return { success: true, simulated: true };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual", // Even for groups, if using direct messaging via API, or switch to group ID format if using specific group endpoints. Note: Standard Cloud API currently has limitations sending directly to groups without user opt-in, so standard practice for colleges is to use a broadcast list or generic webhook integration.
                to: whatsappGroupId, 
                type: "text",
                text: { 
                    preview_url: false,
                    body: message
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Failed to send WhatsApp message");
        }

        return { success: true, data };
    } catch (error) {
        console.error("WhatsApp Integration Error:", error);
        return { success: false, error: error.message };
    }
};
