const fs = require('fs');
const file = 'src/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /attendance: 0,/,
    `attendance: 100,`
);

content = content.replace(
    /if \(attData && attData\.length > 0\) \{\n\s*const present = attData\.filter\(a => \['present', 'late'\]\.includes\(a\.entry_status\)\)\.length;\n\s*const total = attData\.length;\n\s*setStats\(prev => \(\{ \.\.\.prev, attendance: Math\.round\(\(present \/ total\) \* 100\) \}\)\);\n\s*\}/,
    `if (attData && attData.length > 0) {
 const present = attData.filter(a => ['present', 'late'].includes(a.entry_status)).length;
 const total = attData.length;
 setStats(prev => ({ ...prev, attendance: total === 0 ? 100 : Math.round((present / total) * 100) }));
 } else {
 setStats(prev => ({ ...prev, attendance: 100 }));
 }`
);

fs.writeFileSync(file, content);
