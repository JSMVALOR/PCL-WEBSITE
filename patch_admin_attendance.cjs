const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace status: status with status: newStatus in confirmMarkStatus
content = content.replace(/status: status,/g, 'status: newStatus,');
content = content.replace(/update\(\{ status \}\)/g, 'update({ status: newStatus })');

fs.writeFileSync(file, content);
