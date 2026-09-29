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
                            <button onClick={saveChanges} disabled={isSaving} className="px-5 py-3 rounded-xl bg-themeAccent text-themeApp font-bold text-[13px] hover:opacity-90 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
                                {isSaving ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fa-solid fa-check"></i> Save Grid</>}
                            </button>
                        </div>
                    }
                />
            </div>`;

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
