const fs = require('fs');
const file = 'Frontend/ERP/components/shared/DashboardWidgets/FacultyWebClock.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace handleClockOut update eq('id') with eq('faculty_id').eq('date') just in case id is missing
content = content.replace(/\.update\(payload\)\s*\.eq\('id', attendanceRecord\.id\)/g, 
    `.update(payload).eq('faculty_id', userSession.db_id).eq('date', format(new Date(), 'yyyy-MM-dd'))`);

fs.writeFileSync(file, content);
