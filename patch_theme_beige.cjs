const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const newRoot = `  :root {
    /* New Theme: Warm Beige & Chocolate Brown */
    --bg-app: #F4EFE6;
    --bg-panel: #FFFFFF;
    --bg-elevated: #E8DFD1;
    --text-primary: #3E2723;
    --text-secondary: #795548;
    --accent: #5D4037;
    --accent-muted: #8D6E63;
    --border-color: rgba(93, 64, 55, 0.15);
    --border-strong: rgba(93, 64, 55, 0.3);
    --radius-panel: 0.75rem;
    --radius-btn: 0.5rem;
    --border-width: 1px;
    --shadow-elevated: 0 15px 35px -5px rgba(62, 39, 35, 0.08);
    --text-on-accent: #FFFFFF;
    --panel-blur: 40px;
    --panel-opacity: 0.90;
  }`;

content = content.replace(/  :root {[\s\S]*?--panel-opacity: 0\.90;\n  }/, newRoot);
fs.writeFileSync(file, content);
