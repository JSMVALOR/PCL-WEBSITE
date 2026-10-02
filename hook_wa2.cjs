const fs = require('fs');
const path = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(path, 'utf8');

const hook2 = `
 // ---- WHATSAPP INTEGRATION FOR BROADCASTS ----
 try {
   let targetPhones = new Set();
   
   // 1. Check if Global
   if (targetAudience.includes('All') || targetAudience.includes('Student') || targetAudience.includes('Faculty')) {
       const { data: globalSet } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
       if (globalSet && globalSet.value && Array.isArray(globalSet.value)) {
           globalSet.value.forEach(id => targetPhones.add(id));
       }
   }
   
   // 2. Check for specific batches
   const { data: allBatches } = await supabase.from('academic_batches').select('name, whatsapp_group_id');
   if (allBatches) {
       allBatches.forEach(b => {
           if (targetAudience.includes(b.name) && b.whatsapp_group_id) {
               targetPhones.add(b.whatsapp_group_id);
           }
       });
   }
   
   // Insert into queue
   if (targetPhones.size > 0) {
       const waNotifs = Array.from(targetPhones).map(phone => ({
           phone,
           message: \`*[\${category.toUpperCase()}] \${title}*\\n\\n\${content}\${externalLink ? '\\n\\nLink: ' + externalLink : ''}\\n\\n- Prudentia College of Law\`,
           status: 'PENDING'
       }));
       await supabase.from('whatsapp_queue').insert(waNotifs);
   }
 } catch (e) {
   console.error("Failed to queue WA messages for broadcast", e);
 }
 // --------------------------------------------
`;

// Inject into handlePublishNotice right before `sendSystemEmail` or after `// Deduplicate`
const searchTarget = `recipientIds = [...new Set(recipientIds)];`;
if (content.includes(searchTarget)) {
    content = content.replace(searchTarget, searchTarget + "\\n" + hook2);
    fs.writeFileSync(path, content);
    console.log("Injected WA hook into handlePublishNotice");
} else {
    console.log("Could not find target in handlePublishNotice");
}
