const fs = require('fs');
let file = 'Frontend/Website/components/LEGAL/CookieConsent.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace DECLINE button
content = content.replace(
  'className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--primary-color)]/20 text-[var(--primary-color)] text-xs font-bold hover:bg-[var(--primary-color)]/5 active:scale-95 transition-all duration-300"',
  'className="tlh-btn !py-2.5 flex-1 justify-center"'
);

// Replace ACCEPT ALL button
content = content.replace(
  'className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--primary-color)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all duration-300 shadow-md shadow-[var(--primary-color)]/20 hover:shadow-[var(--primary-color)]/40 hover:-translate-y-0.5"',
  'className="tlh-btn !py-2.5 flex-1 justify-center bg-[var(--primary-color)] text-white hover:text-white border-transparent"'
);

fs.writeFileSync(file, content);
