const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Campus Timings to cards
const oldCards = `const cards = [{"id": "coursebuilder", "title": "Course Builder", "icon": "fa-book-open", "desc": "Manage semesters, subjects, and Bar compliance."} , {"id": "timetablebuilder", "title": "Timetable Builder", "icon": "fa-calendar-days", "desc": "Manually schedule classes and auto-generate grids."}, {"id": "allocations", "title": "Mentorship", "icon": "fa-people-arrows", "desc": "Allocate faculty mentors to students."}, {"id": "markscontroller", "title": "Marks Dispatcher", "icon": "fa-file-signature", "desc": "OU Internal marks tracking and CSV exports."}];`;

const newCards = `const cards = [
    {"id": "coursebuilder", "title": "Course Builder", "icon": "fa-book-open", "desc": "Manage semesters, subjects, and Bar compliance."},
    {"id": "timetablebuilder", "title": "Timetable Builder", "icon": "fa-calendar-days", "desc": "Manually schedule classes and auto-generate grids."},
    {"id": "markscontroller", "title": "Marks Dispatcher", "icon": "fa-file-signature", "desc": "OU Internal marks tracking and CSV exports."},
    {"id": "campustimings", "title": "Campus Timings", "icon": "fa-clock", "desc": "Manage working days, Saturday rules, and period slots."}
];`;

content = content.replace(oldCards, newCards);

// 2. Fix #007AFF
content = content.replace(/selection:bg-\[#007AFF\]\/20/g, 'selection:bg-themeAccent/20');
content = content.replace(/bg-\[#007AFF\]\/10/g, 'bg-themeAccent/10');
content = content.replace(/border-\[#007AFF\]\/20/g, 'border-themeAccent/20');
content = content.replace(/text-\[#007AFF\]/g, 'text-themeAccent');

fs.writeFileSync(file, content);
