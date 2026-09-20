const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /<span className="text-4xl font-semibold tracking-tight text-\[#1C1C1E\] dark:text-\[#F2F2F7\]">\{schedule\.length\}<\/span>/,
    `<span className="text-4xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7]">{schedule.filter(s => s.day === { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' }[new Date().getDay()]).length}</span>`
);

fs.writeFileSync(p, c);
console.log("Fixed pulse.");
