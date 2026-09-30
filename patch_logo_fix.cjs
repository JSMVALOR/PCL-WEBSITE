const fs = require('fs');
let file = 'Frontend/index.css';
let content = fs.readFileSync(file, 'utf8');

// Remove the old buggy theme-logo block
content = content.replace(/\/\* Theme Reactive Logo \*\/\n\.theme-logo \{\n  filter: brightness\(0\) invert\(1\); \/\* Default dark mode logo \*\/\n\}\n\n@media \(prefers-color-scheme: light\) \{\n  html:not\(\.dark\) \.theme-logo \{\n    filter: none;\n  \}\n\}/g, '');

// Make sure my new block is there (it should already be at the end, but let's just be sure)
fs.writeFileSync(file, content);
