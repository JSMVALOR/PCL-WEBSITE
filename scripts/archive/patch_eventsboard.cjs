const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="relative w-full overflow-hidden border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] bg-gradient-to-r from-purple-500\/5 via-transparent to-transparent py-8 rounded-3xl shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="w-full mb-2">
    <PageHeader 
        icon="fa-solid fa-calendar-star" 
        title="College Events" 
        subtitle="Upcoming & Past Campus Activities" 
        rightContent={canCreate ? (
            <button type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-purple-600 text-white px-6 py-3.5 rounded-xl font-bold text-[13px] tracking-wide hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
                <i className="fa-solid fa-plus"></i> New Event
            </button>
        ) : null}
    />
</div>`;

if(!content.includes('import PageHeader')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLine = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLine + 1) + `import PageHeader from "../shared/PageHeader/PageHeader";\n` + content.slice(endOfLine + 1);
}

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
