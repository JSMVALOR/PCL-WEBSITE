const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the PageHeader with a div containing the buttons
const replacement = `<div className="w-full mb-6 flex justify-end">
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
                    </div>`;

// Use regex to replace the entire <PageHeader ... /> block
content = content.replace(/<div className="w-full mb-6">\s*<PageHeader[\s\S]*?rightContent=\{([\s\S]*?)\}\s*\/>\s*<\/div>/, replacement);

// Also remove the import of PageHeader
content = content.replace(/import PageHeader from "\.\.\/\.\.\/shared\/PageHeader\/PageHeader";\n/, '');

fs.writeFileSync(file, content);
