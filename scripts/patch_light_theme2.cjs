const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Upgrade the light theme colors to a more premium layout
content = content.replace('--bg-app: #f8f9fa;', '--bg-app: #FAFAFA;');
content = content.replace('--bg-panel: #ffffff;', '--bg-panel: #FFFFFF;');
content = content.replace('--bg-elevated: #f1f5f9;', '--bg-elevated: #F3F4F6;');
content = content.replace('--text-primary: #111111;', '--text-primary: #0F172A;');
content = content.replace('--text-secondary: #555555;', '--text-secondary: #475569;');

// Tweak the gold accent slightly to be richer in light mode
content = content.replace('--accent: #FFC107;', '--accent: #EAB308;');
content = content.replace('--accent-muted: #FFB300;', '--accent-muted: #CA8A04;');

fs.writeFileSync(file, content);
