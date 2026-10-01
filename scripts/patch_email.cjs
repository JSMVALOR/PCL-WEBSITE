const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

file = file.replace(
    /try \{\s*const \{ sendSystemEmail \} = await import\('\.\.\/\.\.\/\.\.\/\.\.\/Shared\/lib\/EmailService\.js'\);\s*await sendSystemEmail\('ACCOUNT_LOCKED', \{ to_email: user\.email, name: user\.name \}\);\s*\} catch\(e\) \{\}/,
    `try {
       await sendSystemEmail('ACCOUNT_LOCKED', { to_email: user.email, name: user.name });
     } catch(e) {}`
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);
