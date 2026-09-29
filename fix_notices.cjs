const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Notices/Notices.jsx';
let content = fs.readFileSync(file, 'utf8');

// The broken part:
// if (userSession?.id) {
//                             }
// }
// } else {
const brokenRegex = /if \(userSession\?\.id\) \{\s*\}\s*\}\s*\} else \{/g;
content = content.replace(brokenRegex, `} else {`);

fs.writeFileSync(file, content);
