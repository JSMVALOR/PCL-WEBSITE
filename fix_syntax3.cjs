const fs = require('fs');

function replaceFileContent(filepath, search, replace) {
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(filepath, content, 'utf8');
}

// 1. FacultyBroadcastForm.jsx
replaceFileContent(
    'Frontend/ERP/components/Student/Notices/FacultyBroadcastForm.jsx',
    /\n\s*\} finally \{/g,
    '\n        finally {'
);

// 2 & 3. AdminAdmissions.jsx
replaceFileContent(
    'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx',
    /\n\s*\}\n\s*setProvisionStatus\("success"\);/g,
    '\n        setProvisionStatus("success");'
);

// 4. SQLStudio.jsx
replaceFileContent(
    'Frontend/ERP/components/Admin/AdminDashboard/SQLStudio.jsx',
    /\n\s*\} finally \{/g,
    '\n        finally {'
);

// 5. AdminSiteEditor.jsx
replaceFileContent(
    'Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx',
    /\n\s*\} else \{/g,
    '\n        /* } else { */'
);

console.log("Fixed final syntax errors.");
