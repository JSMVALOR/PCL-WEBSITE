const fs = require('fs');
const file = 'Frontend/ERP/utils/DialogManager.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /alert: \(message, title = "Notification", isError = null\) => \{[\s\S]*?return new Promise\(\(resolve\) => \{[\s\S]*?if \(_setDialogState\) \{[\s\S]*?_setDialogState\(\{[\s\S]*?isOpen: true,[\s\S]*?type: 'alert',[\s\S]*?isError,[\s\S]*?title,[\s\S]*?message,[\s\S]*?onConfirm: \(\) => \{[\s\S]*?_setDialogState\(prev => \(\{ \.\.\.prev, isOpen: false \}\)\);[\s\S]*?resolve\(true\);[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\} else \{[\s\S]*?console\.warn\("DialogContainer not mounted\. Falling back to native alert\."\);[\s\S]*?window\.alert\(message\);[\s\S]*?resolve\(true\);[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\},/,
    `alert: (message, title = "Notification", isError = null) => {
        if (isError === null) {
            isError = String(message).toLowerCase().includes("error") || String(message).toLowerCase().includes("fail");
        }
        
        // Route alerts to the bottom-right toast system as requested
        if (window.erpToast) {
            window.erpToast.show(message, isError ? 'error' : 'success');
        } else {
            console.warn("ToastContainer not mounted. Falling back to native alert.");
            window.alert(message);
        }
        
        return Promise.resolve(true);
    },`
);

fs.writeFileSync(file, content);
