const fs = require('fs');
let path = 'Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<div className="flex bg-themeElevated rounded-lg p-0.5 border border-themeBorder shadow-inner w-fit">
 <button type="button" onClick={() => setAttendancePhase('entry')} className={\`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all \${attendancePhase === 'entry' ? 'bg-themePanel text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeTextSec dark:hover:text-themeApp/70'}\`}>Phase 1: Entry</button>
 <button type="button" onClick={() => setAttendancePhase('exit')} className={\`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all \${attendancePhase === 'exit' ? 'bg-themePanel text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeTextSec dark:hover:text-themeApp/70'}\`}>Phase 2: Exit</button>
 </div>`;

content = content.replace(target, '');
fs.writeFileSync(path, content);
console.log('Removed Phase 1/2 buttons');
