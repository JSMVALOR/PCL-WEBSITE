const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Revert the gold accent back to the original Amber Gold
content = content.replace('--accent: #EAB308;', '--accent: #FFC107;');
content = content.replace('--accent-muted: #CA8A04;', '--accent-muted: #FFB300;');

fs.writeFileSync(file, content);
