const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminTimetableBuilder/AdminCourseBuilder.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /'bg-themePanel\/85 backdrop-blur-2xl text-themeAccent border border-white dark:border-white\/20 scale-100 shadow-sm'/g,
  "'bg-themePanel text-themeAccent border border-themeBorder scale-100 shadow-sm'"
);

content = content.replace(
  /'text-black\/60 dark:text-white\/70 hover:text-black dark:hover:text-themeText dark:hover:text-white hover:bg-black\/5 dark:hover:bg-white\/10 border border-transparent scale-95 hover:scale-100'/g,
  "'text-themeTextSec hover:text-themeText hover:bg-themeElevated\/50 border border-transparent scale-95 hover:scale-100'"
);

fs.writeFileSync(file, content);
