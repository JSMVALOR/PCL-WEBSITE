const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/Faculty.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="w-full grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-10"',
  'className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-10"'
);

fs.writeFileSync(file, content);
