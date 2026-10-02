const fs = require('fs');
let path = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the time parsing from database to match the generator's format "HH:MM"
content = content.replace(
    'facultySchedule[s.faculty_id][s.day_of_week][s.start_time] = true;',
    'const tStr = s.start_time.substring(0,5);\n facultySchedule[s.faculty_id][s.day_of_week][tStr] = true;'
);

fs.writeFileSync(path, content);
console.log('Fixed AutoGenerator time string matching bug');
