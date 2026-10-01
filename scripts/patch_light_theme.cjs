const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Upgrade the light theme colors to a more premium layout
content = content.replace(
  /--bg-app: #f8f9fa;\n\s+--bg-panel: #ffffff;\n\s+--bg-elevated: #f1f5f9;\n\s+--text-primary: #111111;\n\s+--text-secondary: #555555;/,
  '--bg-app: #FAFAFA;\n      --bg-panel: #FFFFFF;\n      --bg-elevated: #F3F4F6;\n      --text-primary: #0F172A;\n      --text-secondary: #475569;'
);

// Tweak the gold accent slightly to be richer in light mode
content = content.replace(
  /--accent: #FFC107;\n\s+--accent-muted: #FFB300;/,
  '--accent: #EAB308;\n      --accent-muted: #CA8A04;'
);

fs.writeFileSync(file, content);
