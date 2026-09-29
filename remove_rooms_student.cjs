const fs = require('fs');

let content = fs.readFileSync('Frontend/ERP/components/Student/Timetable/Timetable.jsx', 'utf8');

// Remove room from DB fetch
content = content.replace(/room:academic_classrooms\(name\),/g, '');

// Remove room from formatted data
content = content.replace(/room: s\.room\?\.name \|\| 'TBA',/g, '');

// Remove location string from ICS export
content = content.replace(/`LOCATION:\$\{curr\.room\}`,\n/g, '');

// Remove room pill in lecture card
content = content.replace(/<span className="text-\[11px\] font-bold uppercase tracking-widest bg-black\/5 dark:bg-white\/10 backdrop-blur-3xl px-3 py-1\.5 rounded-xl text-themeTextSec dark:text-white\/70 border border-black\/5 dark:border-white\/5">\{lec\.room\}<\/span>/g, '');

// Remove room from nextClass
content = content.replace(/nextClass: \{ day: c\.day, time: c\.time, endTime: c\.endTime, room: c\.room \}/g, 'nextClass: { day: c.day, time: c.time, endTime: c.endTime }');

// Remove room from upcoming banner
content = content.replace(/<p className="text-\[10px\] font-bold text-themeTextSec dark:text-white\/50">\{upcoming\.room\} at \{upcoming\.time\}<\/p>/g, '<p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{upcoming.time}</p>');

// Remove room from details panel
content = content.replace(/<span className="flex items-center gap-1\.5"><i className="fa-solid fa-location-dot"><\/i> \{selectedLecture\.room\}<\/span>/g, '');

// Save changes
fs.writeFileSync('Frontend/ERP/components/Student/Timetable/Timetable.jsx', content);
console.log('Processed Student Timetable');
