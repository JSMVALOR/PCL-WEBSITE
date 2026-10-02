const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/context/ErpContext.jsx', 'utf8');

file = file.replace(
`    // Auto-detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'midnight-justice';
    }`,
`    // Default to the website's beige theme unconditionally
    // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //   return 'midnight-justice';
    // }`
);

fs.writeFileSync('Frontend/ERP/context/ErpContext.jsx', file);
