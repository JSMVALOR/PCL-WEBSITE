const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace card classes
content = content.replace(
  /bg-black\/5 dark:bg-white\/5 p-6 rounded-2xl border border-black\/5 dark:border-white\/10/g,
  "bg-themePanel p-6 rounded-2xl border border-themeBorder"
);

// Replace tags inside cards
content = content.replace(
  /'bg-black\/5 dark:bg-white\/5 backdrop-blur-3xl saturate-\[1\.8\] text-themeTextSec border-black\/5 dark:border-white\/10'/g,
  "'bg-themeElevated text-themeTextSec border-themeBorder'"
);

content = content.replace(
  /bg-black\/5 dark:bg-white\/5 backdrop-blur-3xl saturate-\[1\.8\] text-themeTextSec border border-black\/5 dark:border-white\/10/g,
  "bg-themeElevated text-themeTextSec border border-themeBorder"
);

// Replace input fields
content = content.replace(
  /bg-black\/5 dark:bg-white\/5 backdrop-blur-3xl saturate-\[1\.8\] border border-black\/5 dark:border-white\/10/g,
  "bg-themeElevated border border-themeBorder"
);

fs.writeFileSync(file, content);
