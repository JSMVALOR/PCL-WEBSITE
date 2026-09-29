const fs = require('fs');

const path = 'Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx';
if (!fs.existsSync(path)) process.exit(0);

let content = fs.readFileSync(path, 'utf8');

// Remove room
content = content.replace(/room:academic_classrooms\(name\),/g, '');
content = content.replace(/room: s\.room\?\.name \|\| 'TBA',/g, '');
content = content.replace(/`LOCATION:\$\{curr\.room\}`,\n/g, '');
content = content.replace(/<span className="text-\[11px\] font-bold uppercase tracking-widest bg-black\/5 dark:bg-white\/10 backdrop-blur-3xl px-3 py-1\.5 rounded-xl text-themeTextSec dark:text-white\/70 border border-black\/5 dark:border-white\/5">\{lec\.room\}<\/span>/g, '');
content = content.replace(/nextClass: \{ day: c\.day, time: c\.time, endTime: c\.endTime, room: c\.room \}/g, 'nextClass: { day: c.day, time: c.time, endTime: c.endTime }');
content = content.replace(/<p className="text-\[10px\] font-bold text-themeTextSec dark:text-white\/50">\{upcoming\.room\} at \{upcoming\.time\}<\/p>/g, '<p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{upcoming.time}</p>');
content = content.replace(/<span className="flex items-center gap-1\.5"><i className="fa-solid fa-location-dot"><\/i> \{selectedLecture\.room\}<\/span>/g, '');

fs.writeFileSync(path, content);
console.log('Processed FacultyTimetable');
