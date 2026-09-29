const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /<div className="flex justify-between items-center py-6 border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] shrink-0">[\s\S]*?<\/div>\s*<\/div>/;

const replacement = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-themeAccent/5 via-transparent to-transparent py-8 shrink-0">
                <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-themeAccent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2 md:px-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-themeAccent shadow-sm">
                            <i className="fa-solid fa-table-cells"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Calendar Grid</h1>
                            <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Dynamic Spreadsheet Interface</p>
                        </div>
                    </div>
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
                </div>
            </div>`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(file, content);
