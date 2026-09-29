const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add master_subject_id and faculty_id to the select query
content = content.replace(/id, batch, day_of_week, start_time, end_time,/g, 'id, batch, day_of_week, start_time, end_time, master_subject_id, faculty_id,');

fs.writeFileSync(file, content);
