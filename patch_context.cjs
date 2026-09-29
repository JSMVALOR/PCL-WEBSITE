const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/context/ErpContext.jsx', 'utf8');

content = content.replace(
    /\['apple-hig-light', 'marble-executive', 'structural-neo-brutalism'\]/,
    "['apple-hig-light', 'emerald-chancery', 'imperial-crown', 'structural-neo-brutalism']"
);

fs.writeFileSync('Frontend/ERP/context/ErpContext.jsx', content);
