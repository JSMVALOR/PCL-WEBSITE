const fs = require('fs');

const files = [
    'Frontend/ERP/components/Student/Notices/FacultyBroadcastForm.jsx',
    'Frontend/ERP/components/Student/Credentials/ProfileEditModal.jsx',
    'Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyEditorModal.jsx',
    'Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx',
    'Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\`/g, 
        '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }');
    fs.writeFileSync(file, content, 'utf8');
});

// Also fix FacultyMarks.jsx
let fm = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');
fm = fm.replace(/\n     \} finally \{/g, '\n     finally {');
fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', fm, 'utf8');

console.log("Fixed all remaining errant tokens!");
