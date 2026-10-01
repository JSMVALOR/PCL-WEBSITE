const fs = require('fs');
let file = 'Frontend/ERP/components/shared/ValorLogo.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /text-black dark:text-white/g,
  'text-[var(--text-color)]'
);

fs.writeFileSync(file, content);
