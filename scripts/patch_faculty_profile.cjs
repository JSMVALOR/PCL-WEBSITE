const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/ABOUT/FacultyProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the image shape and size
content = content.replace(
  'className="w-full aspect-[3/4] relative rounded-t-full rounded-b-3xl overflow-hidden mb-10 bg-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] border-[var(--bg-color)] ring-1 ring-[var(--card-border)]"',
  'className="w-2/3 lg:w-4/5 mx-auto lg:mx-0 aspect-square relative rounded-2xl overflow-hidden mb-8 bg-black/5 shadow-2xl border-[4px] border-[var(--bg-color)] ring-1 ring-[var(--card-border)]"'
);

// 2. Adjust margins to make it fit in one slide better
content = content.replace(
  'className="group inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all mb-10 uppercase tracking-[0.2em] text-[10px] font-bold"',
  'className="group inline-flex items-center text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all mb-6 uppercase tracking-[0.2em] text-[10px] font-bold"'
);

// 3. Make sure the sticky top is snug
content = content.replace(
  'lg:sticky lg:top-32 h-fit pb-10"',
  'lg:sticky lg:top-24 h-fit pb-4"'
);

// 4. Reduce gap between image and text
content = content.replace(
  'className="flex flex-col gap-6 items-center lg:items-start w-full"',
  'className="flex flex-col gap-4 items-center lg:items-start w-full"'
);

fs.writeFileSync(file, content);
