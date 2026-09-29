const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Assignments/Assignments.jsx';
let content = fs.readFileSync(file, 'utf8');

// Just append </div> before the last </div>
const lastDivIdx = content.lastIndexOf('</div>');
content = content.slice(0, lastDivIdx) + '</div>\n' + content.slice(lastDivIdx);

fs.writeFileSync(file, content);
