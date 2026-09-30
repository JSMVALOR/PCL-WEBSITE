const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const newRoot = `  :root {
    /* New Theme: Classic Ivory & Saddle Brown */
    --bg-app: #FFFFFF;
    --bg-panel: #FCFBF9;
    --bg-elevated: #F4F1ED;
    --text-primary: #2A201A;
    --text-secondary: #73645B;
    --accent: #8B4513;
    --accent-muted: #A0522D;
    --border-color: rgba(139, 69, 19, 0.15);
    --border-strong: rgba(139, 69, 19, 0.3);
    --radius-panel: 0.75rem;
    --radius-btn: 0.5rem;
    --border-width: 1px;
    --shadow-elevated: 0 10px 30px -5px rgba(42, 32, 26, 0.08);
    --text-on-accent: #FFFFFF;
    --panel-blur: 40px;
    --panel-opacity: 0.90;
  }`;

content = content.replace(/  :root {[\s\S]*?--panel-opacity: 0\.85;\n  }/, newRoot);
fs.writeFileSync(file, content);
