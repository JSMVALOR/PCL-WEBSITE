const fs = require('fs');
let file = 'Frontend/ERP/context/ErpContext.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace default themes
content = content.replace(
  "return 'marble-executive';",
  "return 'prudentia-classic';"
);

// We should also let mobile light theme fallback to prudentia-classic
content = content.replace(
  /newTheme !== 'apple-hig-light'/g,
  "newTheme !== 'prudentia-classic'"
);

content = content.replace(
  /themeToApply !== 'apple-hig-light'/g,
  "themeToApply !== 'prudentia-classic'"
);

content = content.replace(
  /newTheme = 'apple-hig-light';/g,
  "newTheme = 'prudentia-classic';"
);

content = content.replace(
  /themeToApply = 'apple-hig-light';/g,
  "themeToApply = 'prudentia-classic';"
);

// Add to tailwind dark mode fix array
content = content.replace(
  /\[\'apple-hig-light\',/,
  "['prudentia-classic', 'apple-hig-light',"
);

fs.writeFileSync(file, content);
