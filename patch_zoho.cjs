const fs = require('fs');
const files = [
  'Frontend/ERP/components/shared/ZohoDashboard/ZohoLayout.jsx',
  'Frontend/ERP/components/shared/ZohoDashboard/ZohoProfileCard.jsx',
  'Frontend/ERP/components/shared/ZohoDashboard/ZohoMainContent.jsx',
  'Frontend/ERP/components/shared/ZohoDashboard/ZohoReportingCard.jsx',
  'Frontend/ERP/components/shared/ZohoDashboard/ZohoDepartmentMembers.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[\#050505\]/g, 'bg-themeApp');
  content = content.replace(/to-\[\#050505\]/g, 'to-themeApp');
  content = content.replace(/from-\[\#050505\]/g, 'from-themeApp');
  content = content.replace(/bg-\[\#18181A\]/g, 'bg-themeElevated border border-themeBorder');
  fs.writeFileSync(file, content);
});
