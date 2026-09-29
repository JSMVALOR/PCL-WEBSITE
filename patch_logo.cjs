const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const logoRegex = /html\[data-theme="apple-hig-light"\] \.theme-logo,\s*html\[data-theme="marble-executive"\] \.theme-logo,\s*html\[data-theme="structural-neo-brutalism"\] \.theme-logo \{\s*filter: none !important; \/\* ERP light themes \*\/\s*\}/;

content = content.replace(logoRegex, `html[data-theme="apple-hig-light"] .theme-logo,
html[data-theme="marble-executive"] .theme-logo,
html[data-theme="emerald-chancery"] .theme-logo,
html[data-theme="imperial-crown"] .theme-logo,
html.light .theme-logo,
html:not(.dark) .theme-logo,
html[data-theme="structural-neo-brutalism"] .theme-logo {
  filter: none !important; /* ERP light themes */
}`);

fs.writeFileSync(file, content);
