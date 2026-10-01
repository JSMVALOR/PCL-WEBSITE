const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure id matching works by converting to string
content = content.replace(/const draggedClass = schedule\.find\(s => s\.id === draggedId \|\| \(s\.raw && s\.raw\.id === draggedId\)\);/g, 'const draggedClass = schedule.find(s => String(s.id) === String(draggedId) || (s.raw && String(s.raw.id) === String(draggedId)));');

fs.writeFileSync(file, content);
