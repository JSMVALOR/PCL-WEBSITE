const fs = require('fs');

let file = 'Frontend/ERP/components/Faculty/FacultyMentorship/MenteeLeaves.jsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { sendSystemEmail } from '../../../lib/EmailService';`;
if(!content.includes('sendSystemEmail')) {
    content = content.replace(`import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';`, `import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';\n${importStatement}`);
}

const oldHandleAction = `    const handleAction = async (id, status) => {
        try {
            await supabase.from('leave_requests').update({ status }).eq('id', id);
            fetchLeaves();
            window.erpDialog?.alert(\`Leave marked as \${status}\`);
        } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); }
    };`;

const newHandleAction = `    const handleAction = async (leave, status) => {
        try {
            let updatePayload = { status };
            let remarks = "";

            if (status === 'rejected') {
                remarks = await window.erpDialog?.prompt("Please enter a reason for rejecting this leave:", "Reject Leave") || window.prompt("Reason for rejection:");
                if (!remarks) return;
                updatePayload.admin_remarks = remarks;
            }

            const { error } = await supabase.from('leave_requests').update(updatePayload).eq('id', leave.id);
            if (error) throw error;
            
            fetchLeaves();
            window.erpToast?.show?.(\`Leave marked as \${status}\`, 'success');

            // Dispatch Email
            try {
                // Fetch student profile for email
                const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', menteeId).single();
                
                if (profile) {
                    if (status === 'rejected') {
                        await sendSystemEmail('LEAVE_REJECTED', {
                            to_email: profile.email,
                            student_name: profile.full_name,
                            leave_type: leave.leave_type || 'Leave',
                            start_date: leave.from_date,
                            end_date: leave.to_date,
                            reason: remarks
                        });
                    } else {
                        await sendSystemEmail('LEAVE_APPROVED', {
                            to_email: profile.email,
                            student_name: profile.full_name,
                            leave_type: leave.leave_type || 'Leave',
                            start_date: leave.from_date,
                            end_date: leave.to_date
                        });
                    }
                }
            } catch (emailErr) {
                console.warn("Email dispatch failed:", emailErr);
            }
            
        } catch (e) { console.error(e); window.erpToast?.show?.("An error occurred.", 'error'); }
    };`;

content = content.replace(oldHandleAction, newHandleAction);

// We need to update the onClick to pass the whole leave object, not just id
content = content.replace(
    /onClick=\{\(\) => handleAction\(l\.id, 'approved'\)\}/,
    `onClick={() => handleAction(l, 'approved')}`
);
content = content.replace(
    /onClick=\{\(\) => handleAction\(l\.id, 'rejected'\)\}/,
    `onClick={() => handleAction(l, 'rejected')}`
);

fs.writeFileSync(file, content);
