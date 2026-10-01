const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx', 'utf8');

file = file.replace(/master_subject_id/g, 'subject_id');
file = file.replace(/subject:master_subjects/g, 'subject:master_subjects');

fs.writeFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx', file);
