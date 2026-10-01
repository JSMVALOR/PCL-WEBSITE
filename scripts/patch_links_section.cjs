const fs = require('fs');
let file = 'Frontend/Website/components/UI/PremiumFooter/LinksSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// Update Grid Parent
content = content.replace(
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-8 md:gap-y-12 gap-x-4',
  'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-y-6 md:gap-y-12 gap-x-4'
);

// Update Brand
content = content.replace(
  'col-span-1 md:col-span-2 lg:col-span-5',
  'col-span-2 md:col-span-2 lg:col-span-5'
);

// Update Navigation
content = content.replace(
  'flex flex-col items-center text-center lg:items-start lg:text-left col-span-1 md:col-span-1 lg:col-span-2',
  'flex flex-col items-start text-left col-span-1 lg:col-span-2'
);
content = content.replace(
  'ul className="flex flex-col items-center lg:items-start gap-2 md:gap-4"',
  'ul className="flex flex-col items-start gap-2 md:gap-4"'
);

// Update Resources
content = content.replace(
  'flex flex-col items-center text-center lg:items-start lg:text-left col-span-1 md:col-span-1 lg:col-span-2',
  'flex flex-col items-end sm:items-start text-right sm:text-left col-span-1 lg:col-span-2'
);
content = content.replace(
  'ul className="flex flex-col items-center lg:items-start gap-2 md:gap-4"',
  'ul className="flex flex-col items-end sm:items-start gap-2 md:gap-4"'
);

// Update Connect
content = content.replace(
  'col-span-1 md:col-span-2 lg:col-span-3',
  'col-span-2 md:col-span-2 lg:col-span-3'
);
content = content.replace(
  'flex flex-col items-center lg:items-start text-center lg:text-left col-span-2',
  'flex flex-col items-center lg:items-start text-center lg:text-left col-span-2'
);
content = content.replace(
  'ul className="flex flex-col items-center lg:items-start gap-2 md:gap-4 mb-6 md:mb-8 w-full"',
  'ul className="flex flex-col items-center lg:items-start gap-2 md:gap-4 mb-6 md:mb-8 w-full"'
);

fs.writeFileSync(file, content);
