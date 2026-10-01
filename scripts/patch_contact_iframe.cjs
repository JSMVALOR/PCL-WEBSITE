const fs = require('fs');
let file = 'Frontend/Website/components/NAVBAR/CONTACT/Contact.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="w-full h-full rounded-[2rem] border border-[var(--card-border)] grayscale-[0.8] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"',
  'className="w-full h-full rounded-[2rem] border border-[var(--card-border)] grayscale-[0.8] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 pointer-events-none"'
);

fs.writeFileSync(file, content);
