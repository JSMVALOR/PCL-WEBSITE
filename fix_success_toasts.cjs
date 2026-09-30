const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('Frontend/ERP/components/Admin');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Replace window.toast.success(...) with window.erpToast?.show?.(..., 'success')
    const regex1 = /if\s*\(\s*window\.toast\s*\)\s*window\.toast\.success\((.*?)\)/g;
    if (regex1.test(content)) {
        content = content.replace(regex1, 'if (window.erpToast) window.erpToast.show($1, "success")');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log("Fixed success toast in: " + file);
    }
});
