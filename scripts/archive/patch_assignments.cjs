const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Assignments/Assignments.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-indigo-500\/5 via-transparent to-transparent py-8 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
    <PageHeader 
        icon="fa-solid fa-file-signature" 
        title="Assignment Portal" 
        subtitle="Draft & submit coursework" 
        rightContent={
            <div className="flex w-full md:w-auto bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl overflow-x-auto no-scrollbar gap-2 p-1">
                <button type="button"
                    onClick={() => setView("pending")}
                    className={\`flex-1 md:flex-none px-6 py-2 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center justify-center gap-2 rounded-lg \${view === "pending" ? 'bg-themeApp text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText'}\`}>
                    <i className="fa-regular fa-clock"></i> Pending
                </button>
                <button type="button"
                    onClick={() => setView("submitted")}
                    className={\`flex-1 md:flex-none px-6 py-2 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center justify-center gap-2 rounded-lg \${view === "submitted" ? 'bg-themeApp text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText'}\`}>
                    <i className="fa-solid fa-check-double"></i> Submitted
                </button>
            </div>
        }
    />
</div>`;

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
