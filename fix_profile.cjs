const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Credentials/ProfileEditModal.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/profileData\./g, 'profileData?.');

fs.writeFileSync(file, content);
