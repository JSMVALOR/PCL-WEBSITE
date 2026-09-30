const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// Reduce Bio margin
content = content.replace(
  'className="mb-20"',
  'className="mb-8"'
);

// Reduce Ribbon margin and padding
content = content.replace(
  'className="mb-20 py-10 border-y border-[var(--card-border)]/60"',
  'className="mb-10 py-6 border-y border-[var(--card-border)]/60"'
);

// Reduce top padding of the whole right column
content = content.replace(
  'className="w-full lg:w-7/12 flex flex-col pt-4 lg:pt-16"',
  'className="w-full lg:w-7/12 flex flex-col pt-4 lg:pt-8"'
);

fs.writeFileSync(file, content);
