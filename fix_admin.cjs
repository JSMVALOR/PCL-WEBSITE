const fs = require('fs');

// 1. AdminPayroll.jsx
let payrollFile = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
let payroll = fs.readFileSync(payrollFile, 'utf8');
payroll = payroll.replace(/selectedFaculty\.db_id/g, 'selectedFac.id');
fs.writeFileSync(payrollFile, payroll);

// 2. MentorshipAllocations.jsx (Catch block missing)
let mentorshipFile = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx';
let mentorship = fs.readFileSync(mentorshipFile, 'utf8');
mentorship = mentorship.replace(/if \(error\) return;/g, 'if (error) { window.toast?.error("Database error."); return; }');
mentorship = mentorship.replace(/await supabase\.from\('mentorship'\)\.delete\(\)\.neq/g, 'const {error: err} = await supabase.from("mentorship").delete().neq');
fs.writeFileSync(mentorshipFile, mentorship);

// 3. UserManagement.jsx (Reloads and toasts)
let userFile = 'Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx';
let user = fs.readFileSync(userFile, 'utf8');
user = user.replace(
    /const \{ error \} = await supabase\.from\('profiles'\)\.update\(\{ status: newStatus \}\)\.eq\('id', id\);/,
    `const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
        if (!error) { window.toast?.success("Status updated!"); fetchDirectory(); }`
);
fs.writeFileSync(userFile, user);

