const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/ErpApp.jsx', 'utf8');

file = file.replace(/h-screen/g, 'h-[100dvh]');
file = file.replace(/pb-\[110px\]/g, 'pb-[130px]'); // Increase padding just in case

fs.writeFileSync('Frontend/ERP/ErpApp.jsx', file);
