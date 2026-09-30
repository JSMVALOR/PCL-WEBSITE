const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Internships/Internships.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/alert\("Please provide valid start and end dates."\);/g, 'window.toast?.error("Please provide valid start and end dates.");');
content = content.replace(/alert\("Failed to log experience."\);/g, 'window.toast?.error("Failed to log experience.");');

fs.writeFileSync(file, content);
