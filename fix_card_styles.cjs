const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /isSelected \? 'shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] scale-\[1\.02\] border-transparent z-10' : 'border-themeBorder hover:border-themeAccent\/50'/g,
    `isSelected ? 'ring-1 ring-black/10 dark:ring-white/10 shadow-2xl bg-black/[0.02] dark:bg-white/[0.02] z-10 scale-[1.01]' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:shadow-lg'`
);

c = c.replace(
    /style=\{\{ borderColor: isSelected \? tColor\.primary : undefined, boxShadow: isSelected \? \`0 0 0 4px \$\{tColor\.bg\}\` : undefined \}\}/g,
    `style={{ borderColor: isSelected ? tColor.primary : undefined }}`
);

// Remove the weird blur blob from the card background to keep it clean
c = c.replace(
    /<div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-xl -translate-y-1\/2 translate-x-1\/3" style=\{\{ backgroundColor: tColor\.bg \}\}><\/div>/g,
    ``
);

// Reduce the huge header text size again, just to be sure
c = c.replace(
    /text-2xl lg:text-3xl font-black/g,
    `text-xl lg:text-2xl font-black`
);

// Reduce gap between left column and right panel to make it tighter
c = c.replace(
    /<div className="flex flex-col xl:flex-row gap-8 items-start">/g,
    `<div className="flex flex-col xl:flex-row gap-6 items-start">`
);

// Adjust the Course Analytics Engine inside the card to be more subtle
c = c.replace(
    /bg-black\/\[0\.02\] dark:bg-white\/\[0\.02\]/g,
    `bg-transparent`
);

fs.writeFileSync(p, c);
console.log("Fixed card styles.");
