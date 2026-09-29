const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{!isHubView && \([\s\S]*?\}\)/;

const newHeader = `{!isHubView && (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 w-full">
        <PageHeader 
            icon="fa-solid fa-bullhorn" 
            title="System Broadcast" 
            subtitle="Publish notices & manage calendar" 
        />
    </div>
)}`;

content = content.replace(regex, newHeader);
fs.writeFileSync(file, content);
console.log('AdminNotices patched.');
