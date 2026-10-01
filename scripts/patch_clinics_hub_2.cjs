const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminClinicsHub/AdminClinicsHub.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className={`fa-solid ${tab.icon}`}',
  'className={"fa-solid " + tab.icon}'
);

fs.writeFileSync(file, content);
