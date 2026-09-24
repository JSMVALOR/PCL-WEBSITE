const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

// Replace academic_calendar with academic_events
code = code.replace(/from\('academic_calendar'\)/g, "from('academic_events')");

// Fix insert payload for academic_events
code = code.replace(/event_type: eventType,/g, "type: eventType,");

// Wait, the fetchEvents in AdminNotices.jsx also queries academic_calendar. I already replaced it with academic_events above.

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', code);
console.log("Fixed AdminNotices.jsx");
