const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx', 'utf8');

const oldLayout = `<div className="flex flex-col xl:flex-row gap-6 lg:gap-8 shrink-0">
 <div className="flex-[2] min-w-0"><DashboardWorkSchedule role="faculty" /></div>
 <div className="flex-1 min-w-0"><FacultyWebClock /></div>
 </div>`;

const newLayout = `<div className="flex flex-col xl:flex-row-reverse gap-6 lg:gap-8 shrink-0">
 <div className="flex-[1] min-w-0 xl:max-w-[400px]"><FacultyWebClock /></div>
 <div className="flex-[2] min-w-0"><DashboardWorkSchedule role="faculty" /></div>
 </div>`;

file = file.replace(oldLayout, newLayout);
fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyDashboard/FacultyDashboard.jsx', file);
