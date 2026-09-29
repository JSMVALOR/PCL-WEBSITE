const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('window.erpDialog?.alert("Calendar updated successfully!");', 'if (window.erpToast) window.erpToast.show("Calendar updated successfully!", "success"); else window.erpDialog?.alert("Calendar updated successfully!");');

const tableWrapperOld = `<div className="overflow-x-auto">`;
const tableWrapperNew = `<div className="bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm rounded-3xl overflow-hidden px-2 py-4">\n<div className="overflow-x-auto">`;

if (content.includes(tableWrapperOld) && !content.includes(tableWrapperNew)) {
    content = content.replace(tableWrapperOld, tableWrapperNew);
    const lastClosingDiv = content.lastIndexOf('</div>');
    // It's inside a flex wrapper, let's just properly insert the closing div after the table wrapper closes.
    content = content.replace('</table>\n            </div>\n        </div>', '</table>\n            </div>\n            </div>\n        </div>');
}

fs.writeFileSync(file, content);
