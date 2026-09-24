const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', 'utf8');

code = code.replace(
  /} else if \(record.session.subject_id && cohortMap\[record.session.subject_id\]\) {[\s\S]*?}/,
  `} else if (record.session.subject_id) {
                    // Try to find the master subject directly by iterating over cohortMap values
                    const ms = Object.values(cohortMap).find(m => m && m.id === record.session.subject_id);
                    if (ms) masterSubject = ms;
                }`
);

fs.writeFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', code);
console.log("Fixed cohort mapping");
