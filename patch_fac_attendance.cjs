const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

file = file.replace(
  'className="flex bg-black/[0.04] dark:bg-themePanel/[0.04] p-1.5 rounded-2xl border border-themeBorder overflow-x-auto no-scrollbar w-[calc(100vw-32px)] lg:w-fit gap-1"',
  'className="flex bg-black/[0.04] dark:bg-themePanel/[0.04] p-1.5 rounded-2xl border border-themeBorder overflow-x-auto no-scrollbar w-full lg:w-fit gap-1"'
);

// We should also replace the button minimum width to be responsive or just allow it to scroll
file = file.replace(
  'className={`flex-1 min-w-[110px] px-5 py-2.5 rounded-xl',
  'className={`flex-1 min-w-max shrink-0 px-4 py-2.5 rounded-xl'
);

// Also look at the floating nav overlap in ErpApp.jsx main container.
// The user mentioned "All clear" is blocked.
fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', file);
console.log("Patched FacultyAttendance tab bar");
