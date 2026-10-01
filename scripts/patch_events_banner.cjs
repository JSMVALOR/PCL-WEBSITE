const fs = require('fs');
const file = 'Frontend/ERP/components/notices/EventsBoard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{\!isDashboardWidget && \(\s*<div className="w-full mb-2">\s*<PageHeader\s*icon="fa-solid fa-calendar-star"\s*title="College Events"\s*subtitle="Upcoming & Past Campus Activities"\s*\/>\s*<\/div>\s*\)\}/,
  ''
);

fs.writeFileSync(file, content);
