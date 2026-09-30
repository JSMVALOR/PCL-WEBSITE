const fs = require('fs');
let file = 'Frontend/ERP/utils/ToastManager.js';
let content = fs.readFileSync(file, 'utf8');

// Add shim
content = content.replace(
    /window\.erpToast = \{\s*show:/,
    `window.toast = {
        success: (msg) => window.erpToast?.show(msg, 'success'),
        error: (msg) => window.erpToast?.show(msg, 'error')
    };
    
    window.erpToast = {
        show:`
);

fs.writeFileSync(file, content);
