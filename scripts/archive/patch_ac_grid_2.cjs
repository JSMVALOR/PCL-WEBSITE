const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="relative w-full overflow-hidden border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] bg-gradient-to-r from-themeAccent\/5 via-transparent to-transparent py-8 rounded-3xl shrink-0 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="w-full mb-6">
                <PageHeader 
                    icon="fa-solid fa-table-cells" 
                    title="Calendar Grid" 
                    subtitle="Dynamic Spreadsheet Interface" 
                    rightContent={
                        <div className="flex flex-wrap gap-3">
                            <button onClick={addColumn} className="px-5 py-3 rounded-xl bg-black/5 dark:bg-white/10 text-themeText font-bold text-[13px] hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-plus"></i> Add Column
                            </button>
                            <button onClick={addRow} className="px-5 py-3 rounded-xl bg-black/5 dark:bg-white/10 text-themeText font-bold text-[13px] hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-plus"></i> Add Row
                            </button>
                            <button onClick={saveData} disabled={isSaving} className="px-6 py-3 rounded-xl bg-themeAccent text-white font-bold text-[13px] hover:bg-themeAccent/90 transition-colors shadow-lg shadow-themeAccent/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i className="fa-solid fa-floppy-disk"></i> {isSaving ? 'Saving...' : 'Save Grid'}
                            </button>
                        </div>
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
