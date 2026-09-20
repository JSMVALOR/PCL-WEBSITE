const fs = require('fs');

let path = 'src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
if(fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/bg-themeApp border border-themeBorder rounded-2xl p-5/g, 'bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-5');
    content = content.replace(/className="w-20 bg-themeApp/g, 'className="w-20 bg-white/40 dark:bg-white/10');
    fs.writeFileSync(path, content);
}

path = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
if(fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/bg-themeApp border border-themeBorder rounded-2xl p-6/g, 'bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-6');
    content = content.replace(/bg-themeApp border border-themeBorder/g, 'bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-[1.8] border border-black/5 dark:border-white/10');
    fs.writeFileSync(path, content);
}
