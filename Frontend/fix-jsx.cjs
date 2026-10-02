const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{isHubView && \(\n <button type="button"\n onClick=\{handleToggleSpotAdmissions\}/,
  `{isHubView && (
 <>
 <button type="button"
 onClick={handleToggleSpotAdmissions}`
);

content = content.replace(
  /\{isTogglingStatus \? 'Processing\.\.\.' : \(isAdmissionsOpen \? 'Close Admissions' : 'Open Admissions'\)\}\n <\/button>\n \)\}/,
  `{isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </>
 )}`
);

fs.writeFileSync(file, content);
console.log('done');
