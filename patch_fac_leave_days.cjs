const fs = require('fs');
const path = 'src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetPayload = `const payload = {
                faculty_id: userSession.db_id,
                leave_type: leaveType,
                from_date: fromDate,
                to_date: toDate,
                reason: reason,
                status: 'pending',
                replacement_faculty_id: substituteId || null,
                /* replacement_status removed */
            };`;

const newPayload = `const payload = {
                faculty_id: userSession.db_id,
                leave_type: leaveType,
                from_date: fromDate,
                to_date: toDate,
                days: Math.ceil(Math.abs(new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1,
                reason: reason,
                status: 'pending',
                replacement_faculty_id: substituteId || null,
            };`;

content = content.replace(targetPayload, newPayload);
fs.writeFileSync(path, content);
console.log("Patched faculty leave payload to include 'days'");
