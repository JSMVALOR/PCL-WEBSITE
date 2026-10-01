const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx';
let content = fs.readFileSync(file, 'utf8');

const newTheme = `        { id: 'prudentia-classic', name: 'Prudentia Classic', desc: 'Signature Beige & Chocolate', icon: 'fa-scale-balanced', gradient: 'bg-gradient-to-br from-[#efece3] via-[#efece3] to-[#e8e4d8]', accent: 'bg-[#4A3B32]' },\n`;

content = content.replace(
  "const allThemes = [\n",
  "const allThemes = [\n" + newTheme
);

// Remove mobile theme restriction
content = content.replace(
  "const themes = isMobile ? allThemes.slice(0, 2) : allThemes;",
  "const themes = allThemes;"
);

content = content.replace(
  /useEffect\(\(\) => \{\n        if \(isMobile && !themes\.find\(t => t\.id === activeTheme\)\) \{\n            changeTheme\(themes\[0\]\.id\);\n        \}\n    \}, \[isMobile, activeTheme, themes, changeTheme\]\);\n/,
  ""
);

fs.writeFileSync(file, content);
