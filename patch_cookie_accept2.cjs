const fs = require('fs');
let file = 'Frontend/Website/components/LEGAL/CookieConsent.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the second instance of "className=\"tlh-btn !py-2.5 flex-1 justify-center\""
let occurrences = 0;
content = content.replace(/className="tlh-btn !py-2.5 flex-1 justify-center"/g, (match) => {
  occurrences++;
  if (occurrences === 2) {
    return 'className="tlh-btn !py-2.5 flex-1 justify-center !border-[var(--accent)]"';
  }
  return match;
});

fs.writeFileSync(file, content);
