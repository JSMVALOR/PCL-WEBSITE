const fs = require('fs');
let path = 'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find lines to remove: 
// 417: <div className={\`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 \${isEmbedded ? "p-0" : ""}\`}>
// 418: <div className={\`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 \${isEmbedded ? "p-0" : ""}\`}>
// And the closing </div>, document.body
// Wait, is it better to just delete lines 417, 418, 483, 484? Let's trace it.
