const fs = require('fs');
let file = fs.readFileSync('vite.config.js', 'utf8');
file = file.replace(/name: 'Prudentia College of Law ERP',/, "start_url: '/login',\n        scope: '/',\n        name: 'Prudentia College of Law ERP',");
fs.writeFileSync('vite.config.js', file);
