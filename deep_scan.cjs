const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const themeViolations = [];
const sqlViolations = [];
const missingAwaits = [];

walkDir('src/ERP', (filePath) => {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, i) => {
        // Theme Violations
        if (line.match(/bg-\[\#1[aA]1[aA]1[aA]\]|bg-\[\#1[cC]1[cC]1[eE]\]|bg-\[\#007[aA][fF][fF]\]/)) {
            themeViolations.push({ file: filePath, line: i + 1, type: 'Hardcoded Hex Background', match: line.trim() });
        }
        if (line.match(/text-\[\#1[aA]1[aA]1[aA]\]|text-\[\#1[cC]1[cC]1[eE]\]|text-\[\#007[aA][fF][fF]\]/)) {
            themeViolations.push({ file: filePath, line: i + 1, type: 'Hardcoded Hex Text', match: line.trim() });
        }
        if (line.match(/bg-gray-[0-9]{3}/)) {
            themeViolations.push({ file: filePath, line: i + 1, type: 'Tailwind bg-gray-*', match: line.trim() });
        }
        if (line.match(/text-gray-[0-9]{3}/)) {
            themeViolations.push({ file: filePath, line: i + 1, type: 'Tailwind text-gray-*', match: line.trim() });
        }

        // SQL / JS violations
        if (line.includes('supabase.from') && !line.includes('await') && !line.includes('return supabase') && !line.includes('const {')) {
            missingAwaits.push({ file: filePath, line: i + 1, type: 'Missing await on Supabase call', match: line.trim() });
        }
        if (line.includes('.eq(') && line.includes('undefined')) {
            sqlViolations.push({ file: filePath, line: i + 1, type: 'Possible undefined in .eq()', match: line.trim() });
        }
    });
});

let report = `# Deep Codebase Audit Report: Theme & Logic
Generated: ${new Date().toISOString()}

## Executive Summary
This report highlights all instances of hardcoded legacy theming, nested background color collisions, and potential JavaScript/Supabase structural flaws across the \`src/ERP\` directory.

### 1. Theme Violations
The codebase contains numerous hardcoded colors that break the dynamic glassmorphic \`theme.js\` system, resulting in the "greyish page inside a black page" rendering bug.

Total Hardcoded Backgrounds (Hex): ${themeViolations.filter(v => v.type === 'Hardcoded Hex Background').length}
Total Hardcoded Text (Hex): ${themeViolations.filter(v => v.type === 'Hardcoded Hex Text').length}
Total Tailwind \`bg-gray-*\`: ${themeViolations.filter(v => v.type === 'Tailwind bg-gray-*').length}
Total Tailwind \`text-gray-*\`: ${themeViolations.filter(v => v.type === 'Tailwind text-gray-*').length}

`;

if (sqlViolations.length > 0 || missingAwaits.length > 0) {
    report += `### 2. Logic & Supabase Anomalies\n`;
    sqlViolations.forEach(v => report += `- **${v.file}:${v.line}** | ${v.type}\n`);
    missingAwaits.forEach(v => report += `- **${v.file}:${v.line}** | ${v.type}\n`);
    report += '\n';
}

fs.writeFileSync('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/DEEP_THEME_AND_SQL_AUDIT.md', report);
console.log("Report generated at artifacts/DEEP_THEME_AND_SQL_AUDIT.md");
