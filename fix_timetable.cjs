const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Timetable/Timetable.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix slice
content = content.replace(/s\.start_time\.slice/g, "(s.start_time || '00:00').slice");
content = content.replace(/s\.end_time\.slice/g, "(s.end_time || '00:00').slice");

// Fix early return
content = content.replace(
    /if \(\!userSession\?\.academic_batch\) return;/,
    `if (!userSession?.academic_batch) { setLoading(false); return; }`
);

fs.writeFileSync(file, content);
