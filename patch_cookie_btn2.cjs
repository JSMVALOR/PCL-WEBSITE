const fs = require('fs');
let file = 'Frontend/Website/components/LEGAL/CookieConsent.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace both buttons to just use pure tlh-btn
content = content.replace(
  'className="tlh-btn !py-2.5 flex-1 justify-center bg-[var(--primary-color)] text-white hover:text-white border-transparent"',
  'className="tlh-btn !py-2.5 flex-1 justify-center"'
);

fs.writeFileSync(file, content);
