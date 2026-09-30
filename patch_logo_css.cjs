const fs = require('fs');
let file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Remove the old theme-logo block
content = content.replace(/html\[data-theme="prudentia-classic"\] \.theme-logo,[\s\S]*?filter: none !important; \/\* ERP light themes \*\/\n\}/, '');
content = content.replace(/html\[data-theme="apple-hig-light"\] \.theme-logo,[\s\S]*?filter: none !important; \/\* ERP light themes \*\/\n\}/, '');

const newLogoCss = `
/* Global Reactive Logo */
html.dark .theme-logo {
  filter: invert(1) brightness(1.5) drop-shadow(0px 0px 5px rgba(255,255,255,0.2)) !important;
}
html:not(.dark) .theme-logo {
  filter: none !important;
}
`;

content += newLogoCss;

fs.writeFileSync(file, content);
