const fs = require('fs');

function patch(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/window\.erpToast\.show\("Failed to delete user\.", "error"\);/g, 'window.erpToast.show("Delete Failed: " + (e.message || JSON.stringify(e)), "error"); console.error("DELETE ERROR:", e);');
    fs.writeFileSync(file, content);
}

patch('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx');
patch('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx');

