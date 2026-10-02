const fs = require('fs');

// 1. Fix AdminNotices.jsx
let path1 = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content1 = fs.readFileSync(path1, 'utf8');
content1 = content1.replace(
  'recipientIds = [...new Set(recipientIds)];\\n',
  'recipientIds = [...new Set(recipientIds)];\n'
);
fs.writeFileSync(path1, content1);
console.log('Fixed AdminNotices.jsx');

// 2. Fix FacultyMarks.jsx
let path2 = 'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let content2 = fs.readFileSync(path2, 'utf8');
// The issue is an unclosed or mismatched JSX block. 
// I need to look at the exact block around the 'Locked' UI.
