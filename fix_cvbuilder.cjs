const fs = require('fs');
let file = 'Frontend/ERP/components/Student/CVBuilder/CVBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/analytics\.cgpa\.toFixed\(2\)/g, 'Number(analytics.cgpa || 0).toFixed(2)');
content = content.replace(/stats\.cgpa\.toFixed\(2\)/g, 'Number(stats.cgpa || 0).toFixed(2)');

fs.writeFileSync(file, content);
