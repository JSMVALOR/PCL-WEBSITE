const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { sendSystemEmail }")) {
    content = content.replace("import { useState, useEffect }", "import { useState, useEffect } from 'react';\nimport { sendSystemEmail } from '../../../lib/EmailService';");
    // Wait, the import line might be different. Let's just insert it at the top.
    content = "import { sendSystemEmail } from '../../../lib/EmailService';\n" + content;
}

const mentorAssignHook = `await supabase.from('notices').insert([{
                    notice_id: \`MNT-\${Date.now()}\`,
                    title: 'Mentor Assigned',
                    category: 'Academics',
                    target_audience: ['student'],
                    target_user_id: draggedStudent.id,
                    priority: 'normal',
                    content: \`You have been assigned to a new Faculty Mentor. Please check your mentorship portal.\`,
                    author_name: 'Academic Office',
                    author_id: null
                }]);`;
                
const mentorAssignHookNew = `await supabase.from('notices').insert([{
                    notice_id: \`MNT-\${Date.now()}\`,
                    title: 'Mentor Assigned',
                    category: 'Academics',
                    target_audience: ['student'],
                    target_user_id: draggedStudent.id,
                    priority: 'normal',
                    content: \`You have been assigned to a new Faculty Mentor. Please check your mentorship portal.\`,
                    author_name: 'Academic Office',
                    author_id: null
                }]);
                
                // Fetch student email if possible, or fallback (Usually handled by backend or we need the email in draggedStudent)
                if (draggedStudent.email) {
                    await sendSystemEmail('MENTOR_ASSIGNED', {
                        to_email: draggedStudent.email,
                        student_name: draggedStudent.name,
                        mentor_name: newFaculty[facIndex].name
                    });
                }`;

content = content.replace(mentorAssignHook, mentorAssignHookNew);
fs.writeFileSync(file, content);
