const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{!isHubView && \([\s\S]*?<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-themeAccent\/5 via-transparent to-transparent py-8 shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/;

const newHeader = `{!isHubView && (
    <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
        <PageHeader 
            icon="fa-solid fa-bullhorn" 
            title="System Broadcast" 
            subtitle="Publish notices & manage calendar" 
        />
    </div>
)}`;

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
