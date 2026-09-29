const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-themeAccent\/5 via-transparent to-transparent py-8 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
        <PageHeader 
            icon="fa-solid fa-file-signature" 
            title="Assignment Engine" 
            subtitle="Manage offline submissions" 
            rightContent={
                <button type="button" 
                    onClick={() => setShowForm(!showForm)}
                    className={\`px-6 py-3 rounded-xl text-white text-[13px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 \${showForm ? 'bg-neutral-600 hover:bg-neutral-700 shadow-neutral-600/20' : 'bg-themeAccent hover:bg-themeAccent/90 shadow-themeAccent/20'}\`}
                >
                    <i className={\`fa-solid \${showForm ? 'fa-xmark' : 'fa-plus'}\`}></i> 
                    {showForm ? 'Cancel & Close' : 'Create Assignment'}
                </button>
            }
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
