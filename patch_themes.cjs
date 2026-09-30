const fs = require('fs');
let file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Remove the one appended at the end
content = content.replace(/\n  \[data-theme="prudentia-classic"\] \{\n[\s\S]*?--text-on-accent: #efece3;\n  \}/, '');

// Add it inside @layer base right after [data-theme="apple-hig-light"]
const themeBlock = `
  [data-theme="prudentia-classic"] {
    --bg-app: #efece3;
    --bg-panel: #FFFFFF;
    --bg-elevated: #FFFFFF;
    --text-primary: #1a1a1a;
    --text-secondary: #4A3B32;
    --accent: #4A3B32;
    --accent-muted: #E5C07B;
    --border-color: rgba(74, 59, 50, 0.1);
    --border-strong: rgba(74, 59, 50, 0.2);
    --shadow-elevated: 0 8px 30px rgba(74, 59, 50, 0.05);
    --text-on-accent: #efece3;
  }
`;

content = content.replace(
  /(\[data-theme="apple-hig-light"\] \{[\s\S]*?\})/,
  `$1\n${themeBlock}`
);

// Add prudentia-classic to the logo filter exclusion list so the logo isn't inverted
content = content.replace(
  /html\[data-theme="apple-hig-light"\] \.theme-logo,/,
  `html[data-theme="prudentia-classic"] .theme-logo,\nhtml[data-theme="apple-hig-light"] .theme-logo,`
);

fs.writeFileSync(file, content);
