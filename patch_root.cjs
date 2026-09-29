const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const defaultRoot = `
:root {
  --bg-app: #080808;
  --bg-panel: #121212;
  --bg-elevated: #1C1C1C;
  --text-primary: #F5F5F0;
  --text-secondary: #A1A1AA;
  --accent: #FFC107;
  --accent-muted: #C5A880;
  --border-color: rgba(255, 193, 7, 0.1);
  --border-strong: rgba(255, 193, 7, 0.2);
  --radius-panel: 0.75rem;
  --radius-btn: 0.5rem;
  --border-width: 1px;
  --shadow-elevated: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  --text-on-accent: #000000;
  --panel-blur: 40px;
  --panel-opacity: 0.85;
}
`;

if (!content.includes('--bg-app: #080808;')) {
  // Insert before @media (prefers-reduced-motion
  content = content.replace('@media (prefers-reduced-motion', defaultRoot + '\n@media (prefers-reduced-motion');
  fs.writeFileSync(file, content);
}
