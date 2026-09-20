const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const replacements = [
    // Backgrounds
    { regex: /bg-\[\#1[cC]1[cC]1[eE]\]/g, replacement: 'bg-themePanel' },
    { regex: /bg-\[\#1[aA]1[aA]1[aA]\]/g, replacement: 'bg-themeApp' },
    { regex: /bg-\[\#2[cC]2[cC]2[eE]\]/g, replacement: 'bg-themeElevated' },
    
    // Text Colors
    { regex: /text-\[\#1[cC]1[cC]1[eE]\]/g, replacement: 'text-themeText' },
    { regex: /text-\[\#[fF]2[fF]2[fF]7\]/g, replacement: 'text-themeText' },
    { regex: /text-\[\#8[eE]8[eE]93\]/g, replacement: 'text-themeTextSec' },
    { regex: /text-\[\#007[aA][fF][fF]\]/g, replacement: 'text-themeAccent' },
    
    // Text Greys (Common)
    { regex: /text-gray-900/g, replacement: 'text-themeText' },
    { regex: /text-gray-800/g, replacement: 'text-themeText' },
    { regex: /text-gray-700/g, replacement: 'text-themeTextSec' },
    { regex: /text-gray-600/g, replacement: 'text-themeTextSec' },
    { regex: /text-gray-500/g, replacement: 'text-themeTextSec' },
    { regex: /text-gray-400/g, replacement: 'text-themeTextSec' },
    
    // Borders
    { regex: /border-\[\#1[cC]1[cC]1[eE]\]/g, replacement: 'border-themeBorder' },
    { regex: /border-gray-200/g, replacement: 'border-themeBorder' },
    { regex: /border-gray-300/g, replacement: 'border-themeBorder' },
    { regex: /border-gray-700/g, replacement: 'border-themeBorder' },
    { regex: /border-gray-800/g, replacement: 'border-themeBorder' }
];

let filesModified = 0;

walkDir('src/ERP', (filePath) => {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    
    replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        filesModified++;
    }
});

console.log(`Refactored ${filesModified} files successfully!`);
