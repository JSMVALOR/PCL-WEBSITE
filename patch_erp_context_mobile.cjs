const fs = require('fs');
let file = 'Frontend/ERP/context/ErpContext.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(typeof window !== 'undefined' && window\.innerWidth < 768\) \{\n            if \(newTheme !== 'prudentia-classic' && newTheme !== 'midnight-justice'\) \{\n                newTheme = 'prudentia-classic'; \/\/ Fallback to default mobile light theme\n            \}\n        \}/g,
  ""
);

content = content.replace(
  /if \(typeof window !== 'undefined' && window\.innerWidth < 768\) \{\n            if \(themeToApply !== 'prudentia-classic' && themeToApply !== 'midnight-justice'\) \{\n                themeToApply = 'prudentia-classic';\n            \}\n        \}/g,
  ""
);

fs.writeFileSync(file, content);
