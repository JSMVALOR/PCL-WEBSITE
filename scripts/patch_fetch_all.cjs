const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

const findStr = `const sessionExists = (allSessions||[]).find(ses => ses.schedule_id === sch.id && ses.date === dateStr);`;
const findStrRepl = `const sessionExists = (allSessions||[]).find(ses => ses.schedule_id === sch.id && (ses.date === dateStr || (ses.date && ses.date.startsWith(dateStr))));`;
code = code.replace(findStr, findStrRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Patched fetchAllSubjects session search');
