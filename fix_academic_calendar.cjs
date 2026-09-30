const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminAcademicCalendar/AdminAcademicCalendar.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/supabase\.from\(['"]academic_calendar['"]\)\.delete\(\)/g, "supabase.from('academic_events').delete()");

fs.writeFileSync(file, content);
