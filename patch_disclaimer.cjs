const fs = require('fs');
const file = 'Frontend/Website/components/UI/UnifiedDisclaimer.jsx';
let content = fs.readFileSync(file, 'utf8');

// Change btnSecondary to tlh-btn
content = content.replace('className={theme.action.btnSecondary}', 'className="tlh-btn justify-center !py-3"');

// Change btnPrimary to tlh-btn
content = content.replace('className={theme.action.btnPrimary}', 'className="tlh-btn justify-center !py-3"');

fs.writeFileSync(file, content);
