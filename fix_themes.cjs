const fs = require('fs');
let file = 'Frontend/ERP/components/Student/Credentials/AppearanceSettings.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the themes array declaration
content = content.replace(
    /const themes = \[([\s\S]*?)\];/,
    `const allThemes = [$1];\n    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;\n    const themes = isMobile ? allThemes.slice(0, 2) : allThemes;`
);

fs.writeFileSync(file, content);
