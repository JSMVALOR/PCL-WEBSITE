const fs = require('fs');
let file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "var lightThemes = ['marble-executive', 'structural-neo-brutalism'];",
  "var lightThemes = ['prudentia-classic', 'apple-hig-light', 'emerald-chancery', 'imperial-crown', 'marble-executive', 'structural-neo-brutalism'];"
);

fs.writeFileSync(file, content);
