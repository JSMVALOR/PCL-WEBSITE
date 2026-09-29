const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/FacultyBroadcastForm.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in relative flex flex-col h-full"',
    'className="animate-fade-in relative flex flex-col h-full"'
);

fs.writeFileSync(file, content);
