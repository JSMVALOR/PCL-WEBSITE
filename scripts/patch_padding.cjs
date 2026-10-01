const fs = require('fs');

// 1. Fix Programs.module.css
let pcss = fs.readFileSync('Frontend/Website/components/NAVBAR/PROGRAMS/Programs.module.css', 'utf8');
pcss = pcss.replace(/@media \(min-width: 768px\) {\n  \.contentContainer {\n    padding-top: 80px;/g, '@media (min-width: 768px) {\n  .contentContainer {\n    padding-top: 140px;');
fs.writeFileSync('Frontend/Website/components/NAVBAR/PROGRAMS/Programs.module.css', pcss);

// 2. Fix About.jsx
let about = fs.readFileSync('Frontend/Website/components/NAVBAR/ABOUT/About.jsx', 'utf8');
about = about.replace(/pt-\[120px\] md:pt-\[90px\] md:pt-\[120px\]/g, 'pt-[80px] md:pt-[140px]');
fs.writeFileSync('Frontend/Website/components/NAVBAR/ABOUT/About.jsx', about);

