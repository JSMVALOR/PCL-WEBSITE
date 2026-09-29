const fs = require('fs');
const file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{userSession && !isAppLoading && <IntelligentBot />}', '{/* {userSession && !isAppLoading && <IntelligentBot />} */}');

fs.writeFileSync(file, content);
