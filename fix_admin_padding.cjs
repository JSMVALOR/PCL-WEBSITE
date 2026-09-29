const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove padding from main wrapper
content = content.replace(/<div className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 pb-10 lg:pb-10 xl:pb-8 \$\{\!isHubView && 'px-4 lg:px-8'\}`\}>/, '<div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>');

// We need to add padding to the tabs and the content.
// The tabs: <div className="flex w-full border-b ... gap-6">
// Wait, we can wrap tabs and content in a padded div.
const contentWrapperStart = `
    <div className={\`flex flex-col gap-6 lg:gap-8 \${!isHubView && 'px-4 lg:px-8 mt-6'}\`}>
`;

content = content.replace(/<div className="flex w-full border-b border-black\/\[0\.04\] dark:border-white\/\[0\.08\] relative z-10 overflow-x-auto no-scrollbar mb-4 gap-6">/, contentWrapperStart + '<div className="flex w-full border-b border-black/[0.04] dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar gap-6">');

// We must close this wrapper at the end of the file.
content = content.replace(/\{activeTab === 'broadcast' \? renderBroadcastTab\(\) : activeTab === 'events' \? <EventsBoard \/> : <AcademicCalendarGrid \/>\}\n\s*<\/div>\n\s*<\/div>/, `{activeTab === 'broadcast' ? renderBroadcastTab() : activeTab === 'events' ? <EventsBoard /> : <AcademicCalendarGrid />}\n </div>\n </div>\n </div>`);

// Add horizontal padding to the banner content so it doesn't touch the very edges of the screen
content = content.replace(/<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">/, '<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">');

fs.writeFileSync(file, content);
