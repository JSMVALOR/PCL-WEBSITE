const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AcademicCalendarGrid.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\);/g, 'if (window.erpToast) window.erpToast.show("An error occurred: " + err.message, "error"); else window.erpDialog?.alert("Error: " + err.message);');

fs.writeFileSync(file, content);
