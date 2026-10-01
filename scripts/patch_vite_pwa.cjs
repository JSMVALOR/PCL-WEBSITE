const fs = require('fs');
let file = fs.readFileSync('vite.config.js', 'utf8');
file = file.replace(/theme_color: '#050505'/, "theme_color: '#5D4037'");
file = file.replace(/background_color: '#050505'/, "background_color: '#F4EFE6'");
fs.writeFileSync('vite.config.js', file);
