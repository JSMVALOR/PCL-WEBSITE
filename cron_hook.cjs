const fs = require('fs');
let path = 'Backend/whatsapp-engine/server.js';
let content = fs.readFileSync(path, 'utf8');

const hook = `
// ==========================================
// BACKGROUND CRON JOBS (Runs on Render 24/7)
// ==========================================
const cron = require('node-cron');

// Run every day at 17:00 (5 PM) to check for tomorrow's events
cron.schedule('0 17 * * *', async () => {
    console.log('[CRON] Running daily check for upcoming campus leaves/events...');
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Fetch events for tomorrow
        const { data: events, error } = await supabase
            .from('academic_calendar')
            .select('*')
            .eq('start_date', tomorrowStr)
            .in('type', ['holiday', 'campus_leave']);
            
        if (error || !events || events.length === 0) {
            console.log('[CRON] No holidays or campus leaves found for tomorrow.');
            return;
        }

        for (const event of events) {
            console.log(\`[CRON] Processing event: \${event.title}\`);
            
            // 1. WhatsApp Global Broadcast
            const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
            if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
                const groupNotifs = globalSet.value.map(groupId => ({
                    phone: groupId,
                    message: \`*Reminder: \${event.type === 'holiday' ? 'Holiday' : 'Campus Leave'} Tomorrow!*\\n\\n\${event.title}\\nDate: \${new Date(event.start_date).toLocaleDateString()}\\n\\n\${event.description || ''}\\n\\n- Prudentia College of Law\`,
                    status: 'PENDING'
                }));
                if (groupNotifs.length > 0) {
                    await supabase.from('whatsapp_queue').insert(groupNotifs);
                }
            }
            
            // 2. Bell Notifications (for all users)
            const { data: users } = await supabase.from('profiles').select('id');
            if (users && users.length > 0) {
                // Batch insert notifications in chunks of 500 to avoid request limits
                const chunkSize = 500;
                for (let i = 0; i < users.length; i += chunkSize) {
                    const chunk = users.slice(i, i + chunkSize);
                    const notifs = chunk.map(u => ({
                        recipient_id: u.id,
                        title: \`Tomorrow: \${event.title}\`,
                        message: \`Reminder: Tomorrow is a scheduled \${event.type === 'holiday' ? 'holiday' : 'campus leave'}.\`,
                        type: 'notice',
                        action_link: 'notices'
                    }));
                    await supabase.from('notifications').insert(notifs);
                }
            }
        }
        console.log('[CRON] Daily check completed successfully.');
    } catch (e) {
        console.error('[CRON] Failed to run daily check:', e);
    }
}, {
    timezone: "Asia/Kolkata"
});
// ==========================================
`;

if (!content.includes('BACKGROUND CRON JOBS')) {
    content += "\\n" + hook;
    fs.writeFileSync(path, content);
    console.log("Injected node-cron into server.js");
} else {
    console.log("Cron already injected.");
}
