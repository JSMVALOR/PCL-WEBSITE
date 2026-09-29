const fs = require('fs');
const file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

const bodyCSS = `
body {
  background-color: var(--bg-app);
  color: var(--text-primary);
  @apply antialiased font-sans transition-colors duration-500;
}

body ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
body ::-webkit-scrollbar-track {
  background: transparent;
}
body ::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: var(--radius-btn);
  border: 1px solid var(--border-color);
}
body ::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}
`;

if (!content.includes('background-color: var(--bg-app);')) {
  // Insert it before @layer utilities
  content = content.replace('@layer utilities {', bodyCSS + '\n@layer utilities {');
  fs.writeFileSync(file, content);
}
