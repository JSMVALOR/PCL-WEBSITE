const fs = require('fs');
let file1 = 'Frontend/ERP/components/shared/ForcePasswordChangeModal.jsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace(/userSession\.db_id/g, 'userSession?.db_id');
fs.writeFileSync(file1, content1);

let file2 = 'Frontend/ERP/components/shared/QuestionnaireModal.jsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/userSession\.db_id/g, 'userSession?.db_id');
fs.writeFileSync(file2, content2);
