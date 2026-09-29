const fs = require('fs');

let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx', 'utf8');

// Remove room-related fetch
content = content.replace(/\/\/ 1\. Fetch Classrooms[\s\S]*?(?=\/\/ 1\.5 Fetch Faculties)/, '');

// In ScheduleBuilder, room_id, rooms have been removed via sed partially or not? Let's just blindly remove remaining.
content = content.replace(/room:academic_classrooms\(name\),/g, '');
content = content.replace(/room: s\.room\?\.name,/g, '');

// Conflict check
content = content.replace(/const checkConflicts = async \(faculty, room, d, sTime, eTime\) => {/, 'const checkConflicts = async (faculty, d, sTime, eTime) => {');

// Room conflict logic
content = content.replace(/\/\/ Check if room is busy[\s\S]*?(?=\/\/ Check against Pending Local Drafts)/, '');

content = content.replace(/if \(room && draft\.raw\.room_id === room\) return `Room is already booked in your unsaved drafts\.`;/g, '');

// Slot click alert
content = content.replace(/if \(!subjectId \|\| !roomId\) {[\s\S]*?return;\n }/g, 'if (!subjectId) {\n window.erpDialog?.alert("Please select a Subject in the Draw Toolbar first.");\n return;\n }');

content = content.replace(/const conflictMsg = await checkConflicts\(facultyId, roomId, d, timeStr \+ ':00', endTimeStr \+ ':00'\);/g, 'const conflictMsg = await checkConflicts(facultyId, d, timeStr + \':00\', endTimeStr + \':00\');');

content = content.replace(/const selectedRoom = rooms\.find\(r => r\.id === roomId\);/g, '');
content = content.replace(/room: selectedRoom\?\.name,/g, '');
content = content.replace(/room_id: roomId,/g, '');

// Select dropdowns
content = content.replace(/<select className="flex-1 min-w-0 truncate bg-white\/60 dark:bg-themePanel\/60 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] rounded-lg px-3 py-2 text-xs font-bold text-themeText outline-none focus:border-amber-500" value=\{roomId\} onChange=\{e => setRoomId\(e\.target\.value\)\}>\n \{rooms\.map\(r => <option key=\{r\.id\} value=\{r\.id\}>\{r\.name\}<\/option>\)\}\n <\/select>/g, '');

content = content.replace(/<div className="col-span-2">\n <label className="text-\[13px\] font-medium text-themeTextSec mb-1\.5 block">Classroom<\/label>\n <select value=\{roomId\} onChange=\{e => setRoomId\(e\.target\.value\)\} required className="w-full bg-white\/60 dark:bg-themePanel\/60 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none appearance-none transition-colors">\n \{rooms\.map\(r => <option key=\{r\.id\} value=\{r\.id\}>\{r\.name\}<\/option>\)\}\n <\/select>\n <\/div>/g, '');

content = content.replace(/<div className="w-full h-px bg-themeBorder my-1"><\/div>\n <div className="flex justify-between items-center">\n <span className="text-\[13px\] font-medium text-themeTextSec">Room<\/span>\n <span className="text-xs font-bold text-themeText">\{selectedClass\.room\}<\/span>\n <\/div>/g, '');


fs.writeFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/ScheduleBuilder.jsx', content);
console.log('Processed ScheduleBuilder');
