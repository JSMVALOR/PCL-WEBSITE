const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyTimetable/FacultyTimetable.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the entire renderRequests function with an empty string
content = content.replace(/const renderRequests = \(\) => \([\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*\);/, '');

fs.writeFileSync(file, content);
