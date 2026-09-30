const fs = require('fs');
let file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Remove ALL lines that mention theme-logo
let lines = content.split('\n');
let filteredLines = [];
let skipMode = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.theme-logo {')) {
    skipMode = true;
    continue;
  }
  if (lines[i].includes('html.dark .theme-logo {')) {
    skipMode = true;
    continue;
  }
  if (lines[i].includes('html:not(.dark) .theme-logo {')) {
    skipMode = true;
    continue;
  }
  if (lines[i].includes('html:not([data-theme]) .theme-logo {')) {
    skipMode = true;
    continue;
  }
  
  if (skipMode && lines[i].trim() === '}') {
    skipMode = false;
    continue;
  }
  if (skipMode) continue;
  
  // also catch inline
  if (lines[i].includes('.theme-logo')) continue;

  filteredLines.push(lines[i]);
}

content = filteredLines.join('\n');

content += `\n/* Unified ERP Theme Logo */\nhtml.dark .theme-logo {\n  filter: invert(1) brightness(1.5) drop-shadow(0px 0px 5px rgba(255,255,255,0.2)) !important;\n}\nhtml:not(.dark) .theme-logo {\n  filter: none !important;\n}\n`;

fs.writeFileSync(file, content);
