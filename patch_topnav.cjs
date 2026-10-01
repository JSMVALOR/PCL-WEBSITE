const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/TopNav.jsx', 'utf8');

file = file.replace(
  "onClick={() => setActiveTab('credentials')}",
  "onClick={(e) => { if (window.innerWidth < 1024) { e.preventDefault(); setActiveDropdown(activeDropdown === 'profile' ? null : 'profile'); } else { setActiveTab('credentials'); } }}"
);

fs.writeFileSync('Frontend/ERP/components/shared/TopNav.jsx', file);
