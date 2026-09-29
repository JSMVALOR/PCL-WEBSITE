const fs = require('fs');

let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx', 'utf8');

// Remove room fetching
content = content.replace(/\/\/ 2\. Fetch available rooms[\s\S]*?(?=\/\/ 3\. Fetch active cohorts)/, '');

// Remove roomSchedule
content = content.replace(/const roomSchedule = \{\}; \/\/ rId -> day -> time -> bool\n/, '');

// Remove room assignment loop
content = content.replace(/let selectedRoom = null;\n[\s\S]*?if \(selectedRoom\) \{/g, 'if (true) {');

// Remove roomSchedule updates inside the true block
content = content.replace(/if \(!roomSchedule\[selectedRoom\]\) roomSchedule\[selectedRoom\] = \{\};\n if \(!roomSchedule\[selectedRoom\]\[day\]\) roomSchedule\[selectedRoom\]\[day\] = \{\};\n roomSchedule\[selectedRoom\]\[day\]\[slot\.s\] = true;\n/g, '');

content = content.replace(/room_id: selectedRoom,/g, '');

// Change titles
content = content.replace(/Smart Room & Auto-Timetable Engine/g, 'Smart Auto-Timetable Engine');
content = content.replace(/avoids room double-booking,/g, '');

fs.writeFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx', content);
console.log('Processed AutoGenerator');
