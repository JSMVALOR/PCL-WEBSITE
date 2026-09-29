const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-\[#007AFF\]\/5 via-transparent to-transparent py-8 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full shrink-0">
    <PageHeader 
        icon="fa-solid fa-bullhorn" 
        title="Notice Board" 
        subtitle="Official communication & events" 
        rightContent={
            <div className="flex flex-col md:flex-row gap-3 items-center w-full xl:w-auto">
                <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/5 dark:border-white/5 w-full md:w-auto">
                    <button type="button" 
                        onClick={() => {setActiveMainTab('broadcasts'); setSelectedNotice(null); setIsBroadcasting(false);}} 
                        className={\`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold tracking-tight transition-all \${activeMainTab === 'broadcasts' ? 'bg-themeApp text-themeText shadow-sm scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-black/5 dark:hover:bg-white/5 scale-95'}\`}>
                        Broadcasts
                    </button>
                    <button type="button" 
                        onClick={() => {setActiveMainTab('events'); setSelectedNotice(null); setIsBroadcasting(false);}} 
                        className={\`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold tracking-tight transition-all \${activeMainTab === 'events' ? 'bg-themeApp text-themeText shadow-sm scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-black/5 dark:hover:bg-white/5 scale-95'}\`}>
                        Calendar & Events
                    </button>
                </div>
            </div>
        }
    />
</div>`;

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
