const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/CAMPUS/FACILITIES/Facilities.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: The gradient mismatch
content = content.replace(
  'from-[var(--bg-color)] via-[var(--bg-color)]/20',
  'from-[var(--card-solid)] via-[var(--card-solid)]/20'
);

// Also remove bg-[#111] from the image container just in case it leaks through rounded corners
content = content.replace(
  'bg-[#111]',
  'bg-[var(--card-solid)]'
);

// Fix 2: The top clipping on hover
content = content.replace(
  'carousel-container flex overflow-x-auto gap-6 md:gap-8 pb-6',
  'carousel-container flex overflow-x-auto gap-6 md:gap-8 pb-6 pt-4 px-2 -ml-2' // Added pt-4 and horizontal padding/margin to prevent box-shadow clipping on the left too
);

fs.writeFileSync(file, content);
