const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(appError\) \{/,
  `if (appError) {
 console.error("🚨 DATABASE FETCH ERROR:", appError);
 if(window.erpToast) window.erpToast.show("Error fetching applications: " + appError.message, "error");`
);

fs.writeFileSync(file, content);
console.log('done');
