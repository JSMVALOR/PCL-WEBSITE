const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');

file = file.replace(
    /<div className="flex-1 p-2 pb-\[110px\] lg:pb-0 lg:p-6 lg:pt-0 flex flex-col relative z-10">/,
    '<div className="flex-1 p-0 pb-[110px] lg:pb-0 flex flex-col relative z-10">'
);

fs.writeFileSync('Frontend/ERP/ErpApp.jsx', file);
