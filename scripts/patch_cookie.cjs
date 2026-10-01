const fs = require('fs');
let file = 'Frontend/Website/components/LEGAL/CookieConsent.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace background and dark mode colors
content = content.replace(
  'bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10',
  'bg-[var(--bg-app)] border border-[var(--primary-color)]/20'
);

content = content.replace(
  'text-[var(--text-color)]',
  'text-[var(--text-color)]' // Already there
);

// Replace button colors and add animation classes
content = content.replace(
  'className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"',
  'className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs font-bold hover:bg-[var(--primary-color)]/5 active:scale-95 transition-all duration-300"'
);

content = content.replace(
  'className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--primary-color)] text-white dark:text-black text-xs font-bold hover:opacity-90 transition-colors shadow-lg shadow-[var(--primary-glow)]"',
  'className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--primary-color)] text-white text-xs font-bold hover:bg-opacity-90 active:scale-95 transition-all duration-300 shadow-md shadow-[var(--primary-color)]/20 hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5"'
);

fs.writeFileSync(file, content);
