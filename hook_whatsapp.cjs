const fs = require('fs');

const path = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(path, 'utf8');

const hookLogic = `
 // ---- WHATSAPP INTEGRATION ----
 try {
   if (eventType === 'holiday' || eventType === 'campus_leave') {
     // Fetch global broadcast groups
     const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
     if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
       const groupNotifs = globalSet.value.map(groupId => ({
         phone: groupId,
         message: \`*Official Notice: \${eventType === 'holiday' ? 'Holiday' : 'Campus Leave'}*\\n\\n\${eventTitle}\\nDate: \${new Date(eventStartDate).toLocaleDateString()}\\n\\n\${eventDesc}\`,
         status: 'PENDING'
       }));
       if (groupNotifs.length > 0) {
         await supabase.from('whatsapp_queue').insert(groupNotifs);
       }
     }
   }
 } catch (e) {
   console.error("Failed to queue WhatsApp broadcasts", e);
 }
 // -----------------------------
`;

// Insert it right after the bell notification insertion logic
const searchTarget = `await supabase.from('notifications').insert(notifs);`;
if (content.includes(searchTarget)) {
    content = content.replace(searchTarget, searchTarget + "\\n" + hookLogic);
    fs.writeFileSync(path, content);
    console.log("Injected WhatsApp hook into handleScheduleEvent in AdminNotices.jsx");
} else {
    console.log("Could not find insertion point in AdminNotices.jsx");
}
