const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Fix disabled buttons missing cursor-not-allowed (handles multi-line tags)
    content = content.replace(/(<button[^>]+disabled[^>]+className=["'][^"']+)(["'])/g, (match, p1, p2) => {
        if (!p1.includes('cursor-not-allowed')) {
            return p1 + ' disabled:cursor-not-allowed' + p2;
        }
        return match;
    });

    // 2. Fix empty catch blocks and console.error only catch blocks
    // Matches catch (e) {} or catch(err) { console.error(err) }
    content = content.replace(/catch\s*\(([^)]+)\)\s*\{([^}]*)\}/g, (match, errVar, body) => {
        // If it already has toast, skip
        if (body.includes('toast')) return match;
        
        let newBody = body.trim();
        if (newBody === '' || newBody.includes('console.error') || newBody.includes('console.log')) {
            return `catch (${errVar}) { console.error(${errVar}); if (window.toast) window.toast.error("An error occurred. Please try again."); }`;
        }
        return match;
    });

    // 3. Fix icon-only buttons missing aria-label (multiline check)
    content = content.replace(/(<button\s+)([^>]*>)\s*(<i\s+className=[^>]+><\/i>)\s*(<\/button>)/gs, (match, start, attrs, icon, end) => {
        if (!attrs.includes('aria-label')) {
            return start + 'aria-label="Action button" ' + attrs + icon + end;
        }
        return match;
    });
    
    // 4. Add Legal Header if missing
    if (!content.includes('© 2026 JSM VALOR')) {
        content = '/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */\n' + content;
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

console.log('Starting deep automated fixes...');
walkDir('Frontend/ERP/components', processFile);
console.log('Deep automated fixes complete.');
