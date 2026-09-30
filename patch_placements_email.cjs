const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx';
let content = fs.readFileSync(file, 'utf8');

const placementHook = `await supabase.from('notices').insert([{
                    notice_id: \`PLC-\${Date.now()}\`,
                    title: 'Placement Update',
                    category: 'Placements',
                    target_audience: ['student'],
                    target_user_id: app.student_id,
                    priority: 'high',
                    content: \`Your placement application for \${app.placement_drives?.company_name} has been updated to: \${newStatus}\`,
                    author_name: 'Placement Cell',
                    author_id: null
                }]);`;
                
const placementHookNew = `await supabase.from('notices').insert([{
                    notice_id: \`PLC-\${Date.now()}\`,
                    title: 'Placement Update',
                    category: 'Placements',
                    target_audience: ['student'],
                    target_user_id: app.student_id,
                    priority: 'high',
                    content: \`Your placement application for \${app.placement_drives?.company_name} has been updated to: \${newStatus}\`,
                    author_name: 'Placement Cell',
                    author_id: null
                }]);
                
                if (app.profiles?.email) {
                    await sendSystemEmail('PLACEMENT_STATUS_UPDATE', {
                        to_email: app.profiles.email,
                        student_name: app.profiles.full_name || 'Student',
                        company_name: app.placement_drives?.company_name || 'Company',
                        status: newStatus
                    });
                }`;

content = content.replace(placementHook, placementHookNew);
fs.writeFileSync(file, content);
