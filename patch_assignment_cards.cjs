const fs = require('fs');

const path = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(path, 'utf8');

const listWrapperStart = '<div className="flex flex-col">';
const newListWrapper = '<div className="flex flex-col gap-4">';

const oldCard = 'className="py-5 border-b border-themeBorder hover:bg-black/[0.02] dark:hover:bg-themePanel/[0.02] transition-colors flex flex-col gap-4 group px-4"';
const newCard = 'className="p-5 lg:p-6 bg-themePanel/40 backdrop-blur-3xl border border-themeBorder rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col gap-4 group hover:border-amber-500/30"';

content = content.replace(listWrapperStart, newListWrapper);
content = content.replaceAll(oldCard, newCard);

fs.writeFileSync(path, content);
console.log('Patched Assignment cards');
