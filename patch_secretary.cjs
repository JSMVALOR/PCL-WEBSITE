const fs = require('fs');

// Patch 1: About.jsx
let path1 = 'Frontend/Website/components/NAVBAR/ABOUT/About.jsx';
let content1 = fs.readFileSync(path1, 'utf8');
content1 = content1.replace(
  'cofounder_title: content?.cofounder_title || "Co-Founder & Secretary",',
  'cofounder_title: content?.cofounder_title || "Co-Founder & Managing Director",'
);
fs.writeFileSync(path1, content1);
console.log('Patched About.jsx');

// Patch 2: AdminSiteEditor.jsx
let path2 = 'Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx';
let content2 = fs.readFileSync(path2, 'utf8');
content2 = content2.replace(
  '{ key: "cofounder_title", label: "Co-Founder Title", type: "text", fallback: "Co-Founder & Secretary" }',
  '{ key: "cofounder_title", label: "Co-Founder Title", type: "text", fallback: "Co-Founder & Managing Director" }'
);
fs.writeFileSync(path2, content2);
console.log('Patched AdminSiteEditor.jsx');
