const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const dateRegex = /\/\* Force dark color scheme on date inputs[\s\S]*?color-scheme: light;\n\}/;
content = content.replace(dateRegex, `/* Force correct color scheme on date inputs based on dark class */
html.dark input[type="date"] {
  color-scheme: dark;
}
html:not(.dark) input[type="date"] {
  color-scheme: light;
}`);

fs.writeFileSync(file, content);
