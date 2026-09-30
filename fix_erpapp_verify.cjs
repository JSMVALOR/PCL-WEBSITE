const fs = require('fs');
let file = 'Frontend/ERP/ErpApp.jsx';
let content = fs.readFileSync(file, 'utf8');

// The line is: if (!userSession) { ... }
// But wait, there is window.location.pathname.startsWith('/verify') that should bypass the login block!
content = content.replace(
    /if \(\!userSession\) \{/,
    `if (!userSession && !window.location.pathname.startsWith('/verify')) {`
);

fs.writeFileSync(file, content);
