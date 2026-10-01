const fs = require('fs');
const glob = require('glob');

const files = glob.sync('Frontend/ERP/**/*.jsx');

// For now, let's just check if createPortal is used anywhere
let hasPortal = false;
files.forEach(f => {
    const code = fs.readFileSync(f, 'utf8');
    if (code.includes('createPortal')) {
        console.log("Portal found in:", f);
        hasPortal = true;
    }
});

if (!hasPortal) console.log("No portals found.");
