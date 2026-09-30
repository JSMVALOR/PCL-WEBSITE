const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Leave/Leave.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /if \(\!window\.confirm\("Are you sure you want to withdraw this leave request\?"\)\) return;/,
    `const confirmed = await window.erpDialog?.confirm("Are you sure you want to withdraw this leave request?", "Withdraw Request");
    if (!confirmed) return;`
);

fs.writeFileSync(file, content);
