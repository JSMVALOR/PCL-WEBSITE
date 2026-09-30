const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyCard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace flex flex-col justify-end with just standard container
content = content.replace(
  'className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-sm cursor-pointer group bg-black flex flex-col justify-end"',
  'className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-sm cursor-pointer group bg-black"'
);

// Replace the text container with absolute positioning
content = content.replace(
  'className="relative z-10 w-full bg-black/80 backdrop-blur-md border-t-[3px] border-[var(--primary-color)] p-3 md:p-6 overflow-hidden mt-auto"',
  'className="absolute bottom-0 left-0 right-0 z-10 w-full bg-black/80 backdrop-blur-md border-t-[3px] border-[var(--primary-color)] p-3 md:p-6 overflow-hidden"'
);

fs.writeFileSync(file, content);
