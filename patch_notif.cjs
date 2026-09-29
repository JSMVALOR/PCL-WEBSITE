const fs = require('fs');

function injectNotification(file, regex, replaceFn) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replaceFn);
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
}

// ProfileEditModal.jsx
injectNotification(
    'Frontend/ERP/components/Student/Credentials/ProfileEditModal.jsx',
    /(const \{ data, error \} = await supabase\s*\.from\('profile_update_requests'\)\s*\.insert\(\{[\s\S]*?\}\)\s*\.select\(\)\s*\.single\(\);[\s\S]*?if \(error\) throw error;)/,
    (match, p1) => {
        return p1 + `\n\n                // Notify Admins
                const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'admin');
                if(adminProfiles && adminProfiles.length > 0) {
                    const notifs = adminProfiles.map(admin => ({
                        recipient_id: admin.id,
                        title: 'Profile Update Request',
                        message: \`\${profileData.full_name || 'A student'} has requested a profile update.\`,
                        type: 'system',
                        action_link: 'adminapprovals'
                    }));
                    await supabase.from('notifications').insert(notifs);
                }\n`;
    }
);

// FacultyLeaves
injectNotification(
    'Frontend/ERP/components/Faculty/Approvals/Approvals.jsx',
    /(const \{ data, error \} = await supabase\s*\.from\('faculty_leave_requests'\)\s*\.insert\(\{[\s\S]*?\}\)\s*\.select\(\)\s*\.single\(\);[\s\S]*?if \(error\) throw error;)/,
    (match, p1) => {
        return p1 + `\n\n            // Notify Admins
            const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'admin');
            if(adminProfiles && adminProfiles.length > 0) {
                const notifs = adminProfiles.map(admin => ({
                    recipient_id: admin.id,
                    title: 'Faculty Leave Request',
                    message: \`\${userSession.full_name || 'A faculty member'} has applied for leave.\`,
                    type: 'leave',
                    action_link: 'adminapprovals'
                }));
                await supabase.from('notifications').insert(notifs);
            }\n`;
    }
);

// Grievances Escalation (escalateGrievance)
injectNotification(
    'Frontend/ERP/components/shared/GrievanceCell.jsx',
    /(const \{ error \} = await supabase\s*\.from\('grievances'\)\s*\.update\(\{ status: 'escalated' \}\)\s*\.eq\('id', id\);[\s\S]*?if \(error\) throw error;)/,
    (match, p1) => {
        return p1 + `\n\n            // Notify Admins
            const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'admin');
            if(adminProfiles && adminProfiles.length > 0) {
                const notifs = adminProfiles.map(admin => ({
                    recipient_id: admin.id,
                    title: 'Grievance Escalated',
                    message: \`A grievance has been escalated to administration.\`,
                    type: 'system',
                    action_link: 'adminapprovals'
                }));
                await supabase.from('notifications').insert(notifs);
            }\n`;
    }
);

// Also Grievances Creation
injectNotification(
    'Frontend/ERP/components/shared/GrievanceCell.jsx',
    /(const \{ error \} = await supabase\s*\.from\('grievances'\)\s*\.insert\(\[payload\]\);[\s\S]*?if \(error\) throw error;)/,
    (match, p1) => {
        return p1 + `\n\n            if(payload.status === 'escalated') {
                const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'admin');
                if(adminProfiles && adminProfiles.length > 0) {
                    const notifs = adminProfiles.map(admin => ({
                        recipient_id: admin.id,
                        title: 'Grievance Escalated',
                        message: \`A newly filed grievance was escalated directly to administration.\`,
                        type: 'system',
                        action_link: 'adminapprovals'
                    }));
                    await supabase.from('notifications').insert(notifs);
                }
            }\n`;
    }
);


