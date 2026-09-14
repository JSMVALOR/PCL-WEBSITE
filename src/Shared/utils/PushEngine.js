/* © 2026 JSM VALOR. All Rights Reserved. */
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../lib/supabase/supabaseClient';

export const setupPushNotifications = async (userId) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Request Permission
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive !== 'granted') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            return;
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        // Listen for registration success and save FCM token to DB
        PushNotifications.addListener('registration', async (token) => {
            
            // Save token to telemetry table or new fcm_tokens table
            const deviceId = localStorage.getItem('jsmerp_session_tracker_id');
            if (deviceId && userId) {
                // For now, we update the existing user_sessions table with the FCM token (requires column)
                // If column doesn't exist, this fails safely.
                supabase.from('user_sessions')
                    .update({ fcm_token: token.value })
                    .eq('id', deviceId)
                    .then(({ error }) => {
                        if (error) return;
                    });
            }
        });

        // Error with registration
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Show push notification payload when app is open (Foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            // Trigger a UI toast or internal event here if needed
        });

        // Action performed on a push notification (Background/Tapped)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            // Navigate to specific screen based on payload
        });

    } catch (error) {
        console.error("Push Setup Error:", error);
    }
};
