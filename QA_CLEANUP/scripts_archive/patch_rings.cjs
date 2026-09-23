const fs = require('fs');
let p = 'src/ERP/components/shared/DashboardWidgets/StudentActivityRings.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    `.from('assignments')
                .select('status')
                .eq('student_id', userSession?.id || 'default');`,
    `.from('assignment_submissions')
                .select('status')
                .eq('student_id', userSession?.db_id || userSession?.id || 'default');`
);

c = c.replace(
    `.from('attendance')
                .select('status')
                .eq('profile_id', userSession?.id || 'default');`,
    `.from('attendance_records')
                .select('entry_status')
                .eq('student_id', userSession?.db_id || userSession?.id || 'default');`
);

c = c.replace(
    `const present = attendance.filter(a => a.status === 'present').length;`,
    `const present = attendance.filter(a => a.entry_status === 'present').length;`
);

c = c.replace(
    `.from('attendance')
                .select('status', { count: 'exact', head: true });`,
    `.from('attendance_records')
                .select('id', { count: 'exact', head: true });`
);

c = c.replace(
    `.from('attendance')
                .select('status', { count: 'exact', head: true })
                .eq('status', 'present');`,
    `.from('attendance_records')
                .select('id', { count: 'exact', head: true })
                .eq('entry_status', 'present');`
);

fs.writeFileSync(p, c);
console.log("Rings patched");
