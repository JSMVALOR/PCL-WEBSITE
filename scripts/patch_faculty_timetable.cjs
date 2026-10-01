const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove 'Requests' from tabs
content = content.replace(/\['Timeline', 'Week', 'Requests'\]/, "['Timeline', 'Week']");

// Remove the render block for requests
content = content.replace(/\{activeTab === 'requests' && renderRequests\(\)\}/, '');

// Remove the "Pending Reqs" block from the sidebar
content = content.replace(/<div className="flex flex-col gap-1">\s*<span className="text-4xl font-semibold tracking-tight text-\[#FF9500\]">\{requests\.filter\(r => r\.status === 'Pending'\)\.length\}<\/span>\s*<span className="text-\[13px\] font-medium text-themeTextSec">Pending Reqs<\/span>\s*<\/div>/, '');

fs.writeFileSync(file, content);
