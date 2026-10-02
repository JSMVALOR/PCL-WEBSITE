const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldPrompt = `  const joiningDate = await window.erpDialog?.prompt(
    \`Enter Official Joining Date for \${app.name} (YYYY-MM-DD) for Attendance calculation:\`,
    "Admission Profile Configuration",
    new Date().toISOString().split('T')[0]
  );
  if (joiningDate === null) return;`;

const newCode = `  const joiningDate = new Date().toISOString().split('T')[0];`;

content = content.replace(oldPrompt, newCode);

fs.writeFileSync(file, content);
console.log('done');
