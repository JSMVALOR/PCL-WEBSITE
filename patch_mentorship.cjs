const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminMentorship/AdminMentorship.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-emerald-500\/5 via-transparent to-transparent py-8 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s;

const newHeader = `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
    <PageHeader 
        icon="fa-solid fa-server" 
        title="Mentorship Engine" 
        subtitle="Centralized administration for mentor mapping" 
    />
</div>`;

// Add import
if(!content.includes('import PageHeader')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLine = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLine + 1) + `import PageHeader from "../../shared/PageHeader/PageHeader";\n` + content.slice(endOfLine + 1);
}

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
console.log('Patched AdminMentorship.jsx');
