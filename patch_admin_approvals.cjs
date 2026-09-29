const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx';
let content = fs.readFileSync(file, 'utf8');

// Use regex to remove the button block for Timetable Reschedules
content = content.replace(/<button type="button"\s*onClick=\{\(\) => setActiveTab\('timetable_reschedules'\)\}\s*className=\{`flex-1 lg:flex-none px-5 py-3 rounded-xl text-\[10px\] lg:text-\[14px\] font-medium tracking-normal transition duration-300 whitespace-nowrap min-w-max \$\{activeTab === 'timetable_reschedules' \? 'bg-themeAccent text-themeApp border border-themeAccent scale-100 shadow-\[0_0_15px_rgba\(var\(--accent-rgb\),0\.3\)\]' : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated border border-transparent scale-95 hover:scale-100'\}`\}\s*>\s*Timetable Reschedules\s*<\/button>/g, '');

fs.writeFileSync(file, content);
