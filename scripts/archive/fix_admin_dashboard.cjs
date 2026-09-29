const fs = require('fs');

// 1. Fix AdminDashboard.jsx - remove scroll on desktop, tighten layout
let dash = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', 'utf8');

// Remove pb-10 from main content area that pushes overflow
dash = dash.replace(
  'className="xl:col-span-9 flex flex-col gap-8 pb-10 xl:pb-12 min-w-0 animate-fade-in"',
  'className="xl:col-span-9 flex flex-col gap-6 min-w-0 animate-fade-in"'
);

// Tighten the outer wrapper gaps and remove excessive bottom padding
dash = dash.replace(
  /className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 \$\{\!isEmbedded \? "p-4 sm:p-6 lg:p-8 pb-10 xl:pb-8" : "pb-10"\}`\}/,
  'className={`w-full max-w-[1800px] mx-auto flex flex-col gap-4 lg:gap-6 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 xl:pb-4" : "pb-6"}`}'
);

// Tighten the grid gap
dash = dash.replace(
  'className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"',
  'className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', dash);

// 2. Fix UpdatesCarousel.jsx - the carousel container needs overflow:hidden and proper sizing
let carousel = fs.readFileSync('Frontend/ERP/components/shared/UpdatesCarousel/UpdatesCarousel.jsx', 'utf8');

// Fix the outer wrapper: needs overflow-hidden so slides don't break out
carousel = carousel.replace(
  'className="flex-1 w-full relative h-full group min-w-[280px] lg:max-w-[400px]"',
  'className="flex-1 w-full relative h-full group min-w-0 overflow-hidden rounded-2xl border border-black/5 dark:border-white/5"'
);

// Fix the dot indicators background - currently broken with conflicting dark classes
carousel = carousel.replace(
  'className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-gray-50 dark:bg-black/20 dark:bg-white/20 backdrop-blur-xl px-3 py-1.5 rounded-full"',
  'className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/30 backdrop-blur-xl px-3 py-1.5 rounded-full"'
);

fs.writeFileSync('Frontend/ERP/components/shared/UpdatesCarousel/UpdatesCarousel.jsx', carousel);

// 3. Fix AdminRightSidebar.jsx - fix carousel container height
let sidebar = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx', 'utf8');

// The fixed h-[360px] is likely causing overflow; let it flex naturally
sidebar = sidebar.replace(
  'className="w-full relative h-[360px]"',
  'className="w-full relative h-[320px] overflow-hidden rounded-2xl"'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx', sidebar);

console.log("Done patching Admin Dashboard");
