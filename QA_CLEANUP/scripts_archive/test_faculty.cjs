const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

// Insert a console log right before insert to see if we are missing anything
content = content.replace(
    /console\.log\("INSERTING:", \{ schedule_id: missedSlot\.sch_id, faculty_id: userSession\.db_id, date: missedSlot\.date \}\);/g,
    `console.log("INSERTING:", { schedule_id: missedSlot.sch_id, faculty_id: userSession.db_id, date: missedSlot.date });
                if (!missedSlot.sch_id || !userSession.db_id || !missedSlot.date) {
                    window.erpDialog?.alert("Missing required fields for insert!");
                    throw new Error("Missing required fields for insert!");
                }`
);

fs.writeFileSync(path, content);
console.log("Patched test_faculty.");
