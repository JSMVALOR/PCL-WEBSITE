const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Remove the ADDITIONAL ERP THEMES block
const additionalThemesRegex = /\/\* ADDITIONAL ERP THEMES \*\/[\s\S]*?(?=\/\* Custom Date Picker Styling \*\/)/;
content = content.replace(additionalThemesRegex, '');

fs.writeFileSync(file, content);
