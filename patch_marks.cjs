const fs = require('fs');

const path = 'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldPrompt = '<div className="bg-black/[0.02] dark:bg-themePanel/[0.02] border border-themeBorder rounded-[2rem] p-6 lg:p-8">';
const newPrompt = '<div className="bg-themePanel/40 backdrop-blur-3xl border border-themeBorder rounded-[2rem] p-6 lg:p-8 shadow-sm">';

content = content.replace(oldPrompt, newPrompt);

fs.writeFileSync(path, content);
console.log('Patched FacultyMarks.jsx prompt block');
