const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/lib/emailtemplate.js', 'utf8');

// Change #0a0a0a (black) to #dc2626 (red)
content = content.replace(/#0a0a0a/g, '#dc2626');
// Change #b59c72 (gold) to #ffffff (white) or a light gray #f4f4f5 where appropriate
// Wait, if header is red, logo should be white, border bottom should be something else.
content = content.replace(/border-bottom: 3px solid #b59c72/g, 'border-bottom: 3px solid #991b1b');
content = content.replace(/fill: #b59c72/g, 'fill: #ffffff');
content = content.replace(/color: #b59c72/g, 'color: #fecaca'); // light red for subtitle
content = content.replace(/border-left: 3px solid #b59c72/g, 'border-left: 3px solid #dc2626');

content = content.replace(/background-color: #0a0a0a; color: #ffffff !important/g, 'background-color: #dc2626; color: #ffffff !important');

// Logo image
content = content.replace(/pcl_logo_gold\.svg/g, 'pcl_logo_white.svg');

fs.writeFileSync('Frontend/ERP/lib/emailtemplate.js', content);
