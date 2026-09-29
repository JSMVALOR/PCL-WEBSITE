const fs = require('fs');
const file = 'Frontend/Website/components/HOME/ADVANTAGES/Advantages.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12 px-4 md:px-0">',
  'mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12 px-4 md:px-12 lg:px-16">'
);

fs.writeFileSync(file, content);
