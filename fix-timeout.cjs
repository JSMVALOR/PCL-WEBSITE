const fs = require('fs');
const file = 'Frontend/ERP/components/shared/SessionTimeoutGuard.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetFunc = ` const resetInactivityTimer = () => {
 if (Capacitor.isNativePlatform()) return; 

 if (showWarning) return; `;

const newFunc = ` const resetInactivityTimer = () => {
 // Disabled per admin directive: Session lasts life long till manual logout
 return;
 
 if (Capacitor.isNativePlatform()) return; 

 if (showWarning) return; `;

if(content.includes(targetFunc)) {
    content = content.replace(targetFunc, newFunc);
    fs.writeFileSync(file, content);
    console.log('done');
} else {
    console.log('not found');
}
