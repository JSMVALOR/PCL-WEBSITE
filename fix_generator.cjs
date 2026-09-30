const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/AutoGenerator.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const generateTimetable = async \(\) => \{/,
    `const generateTimetable = async () => {
    const confirm = await window.erpDialog?.confirm("WARNING: This will DESTROY the existing timetable and generate a new one from scratch. Proceed?", "Regenerate Timetable");
    if (!confirm) return;`
);

fs.writeFileSync(file, content);
