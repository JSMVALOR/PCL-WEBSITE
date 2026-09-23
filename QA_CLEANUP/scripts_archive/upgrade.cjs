const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const holdButtonStr = "import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';\nimport { HugeiconsIcon } from '@hugeicons/react';\nimport { Delete02Icon } from '@hugeicons/core-free-icons';";
const slideCommitStr = "import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';";

function addImport(content, importStr, filePath) {
    if (content.includes(importStr.split(' ')[1])) return content; // basic check
    
    // Calculate relative path to src/Shared/components/ReactBits
    const depth = filePath.split(path.sep).length - 2; // -1 for src, -1 for file
    const rel = '../'.repeat(depth) + 'Shared/components/ReactBits/';
    
    let toInject = importStr.replace(/\.\.\/\.\.\/\.\.\/\.\.\/Shared\/components\/ReactBits\//g, rel);
    
    return content.replace(/import React.*?['"];/m, match => match + '\n' + toInject);
}

walk('src/ERP', filePath => {
    if (!filePath.endsWith('.jsx')) return;
    
    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    
    // 1. DELETE BUTTONS -> HoldButton
    // Try to match `<button ... onClick={() => handle...(id)} ...> ... </button>` or `<button ... onClick={handle...}> ... </button>`
    const btnRegex = /<button[^>]*?onClick=\{([^}]+)\}[^>]*?>([\s\S]*?)<\/button>/g;
    
    content = content.replace(btnRegex, (match, onClickContent, innerHTML) => {
        const isDelete = innerHTML.toLowerCase().includes('delete') || innerHTML.includes('fa-trash') || innerHTML.includes('Trash');
        const isApprove = innerHTML.match(/Approve(?!\s*<)/) || innerHTML.match(/Confirm(?!\s*<)/) || innerHTML.match(/Publish(?!ed)/); // Match the word Approve/Confirm, not just tags

        if (isDelete && !match.includes('HoldButton')) {
            // Check if it's disabled. HoldButton doesn't natively support disabled yet but we can conditionally render it? No, just replace it.
            // Also we need to strip `window.confirm` from the handler if it exists. But the handler is usually defined elsewhere. We can't easily parse that here. We'll just replace the button and leave the handler as is (user will have to tap and hold AND click ok, which is acceptable or we can try to strip it).
            
            let onHold = onClickContent; 
            // e.g. `() => handleDelete(id)` or `handleDelete`
            
            return `<HoldButton size="sm" onHold={${onHold}} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                ${innerHTML.replace(/<i.*?<\/i>/g, '').trim() || null}
            </HoldButton>`;
        }
        
        if (isApprove && !match.includes('SlideCommit')) {
            let label = "Slide to " + (innerHTML.includes('Approve') ? 'Approve' : innerHTML.includes('Publish') ? 'Publish' : 'Confirm');
            return `<SlideCommit
                label="${label}"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={${onClickContent}}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />`;
        }
        
        return match;
    });
    
    if (content !== original) {
        if (content.includes('HoldButton')) {
            content = addImport(content, holdButtonStr, filePath);
        }
        if (content.includes('SlideCommit')) {
            content = addImport(content, slideCommitStr, filePath);
        }
        
        // Let's quickly try to strip confirm() out of the file for known delete handlers
        content = content.replace(/if \(!window\.confirm\([^)]+\)\) return;/g, '');
        content = content.replace(/if \(!confirm\([^)]+\)\) return;/g, '');
        content = content.replace(/if \(!await window\.erpDialog\?\.confirm\([^)]+\)\) return;/g, '');
        
        fs.writeFileSync(filePath, content);
        console.log("Upgraded buttons in", filePath);
    }
});
