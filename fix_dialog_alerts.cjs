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

    // Replace window.erpDialog.alert(...) or window.erpDialog?.alert(...) when the message contains success/Failed
    // Regex matches window.erpDialog(?:\.|\?\.)alert\((["'\`].*?(?:success|Failed).*?["'\`])\)
    // and converts it to if(window.erpToast) window.erpToast.show($1, "success"/"error")
    
    // Custom replacer function to determine type based on message text
    const regex = /window\.erpDialog(?:\.|\?\.)alert\((["'`].*?["'`])\s*(?:,\s*["'`][^"'`]*["'`]\s*(?:,\s*(?:true|false))?)?\)/g;
    
    let newContent = content.replace(regex, (match, msgGroup) => {
        const msgStr = msgGroup.toLowerCase();
        let type = 'info';
        if (msgStr.includes('success') || msgStr.includes('✅')) type = 'success';
        if (msgStr.includes('fail') || msgStr.includes('error')) type = 'error';
        
        // Only convert if it's explicitly success or error, otherwise leave as alert
        if (type !== 'info') {
            changed = true;
            return `if(window.erpToast) window.erpToast.show(${msgGroup}, "${type}")`;
        }
        return match;
    });
    
    // Edge case: strings constructed with + error.message inside the alert
    const regexConcat = /window\.erpDialog(?:\.|\?\.)alert\((["'`].*?["'`]\s*\+\s*[a-zA-Z0-9_\.]*)\)/g;
    newContent = newContent.replace(regexConcat, (match, expression) => {
        const expStr = expression.toLowerCase();
        let type = 'info';
        if (expStr.includes('success')) type = 'success';
        if (expStr.includes('fail') || expStr.includes('error')) type = 'error';
        
        if (type !== 'info') {
            changed = true;
            return `if(window.erpToast) window.erpToast.show(${expression}, "${type}")`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, newContent);
        console.log("Fixed dialog alert in: " + file);
    }
});
