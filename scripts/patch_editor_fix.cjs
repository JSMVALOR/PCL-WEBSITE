const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

file = file.replace(
    /<\/button>\s*<\/div>\s*<\/div>\s*<\/div>,\s*document\.body/,
    '</button>\n </div>\n </div>\n </div>\n </div>,\n document.body'
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);
