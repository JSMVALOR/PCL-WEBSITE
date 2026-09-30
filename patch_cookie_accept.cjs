const fs = require('fs');
let file = 'Frontend/Website/components/LEGAL/CookieConsent.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<button \n              onClick={handleAccept}\n              className="tlh-btn !py-2.5 flex-1 justify-center"\n            >',
  '<button \n              onClick={handleAccept}\n              className="tlh-btn !py-2.5 flex-1 justify-center !border-[var(--accent)]"\n            >'
);

fs.writeFileSync(file, content);
