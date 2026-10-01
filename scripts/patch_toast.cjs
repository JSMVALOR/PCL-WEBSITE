const fs = require('fs');

const file = 'Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    /if \(window\.toast && typeof window\.toast\.success === 'function'\) \{\n\s*window\.toast\.success\("User details updated successfully!"\);\n\s*\}/g,
    'if (window.erpToast) window.erpToast.show("User details updated successfully!", "success");'
);
fs.writeFileSync(file, content);
