const fs = require('fs');
const { execSync } = require('child_process');

const dirsToScan = ['Frontend/ERP/components', 'Frontend/ERP/ErpApp.jsx'];
const patterns = [
  { regex: /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g, name: 'Hex colors' },
  { regex: /\bbg-white\b/g, name: 'bg-white' },
  { regex: /\btext-black\b/g, name: 'text-black' },
  { regex: /\btext-white\b/g, name: 'text-white (often used in buttons, maybe ok if on accent)' },
  { regex: /\bbg-gray-\d{2,3}\b/g, name: 'bg-gray-*' },
  { regex: /\btext-gray-\d{2,3}\b/g, name: 'text-gray-*' },
  { regex: /\bborder-gray-\d{2,3}\b/g, name: 'border-gray-*' },
];

let issues = {};

dirsToScan.forEach(dir => {
  try {
    const isFile = fs.statSync(dir).isFile();
    const files = isFile ? [dir] : execSync(`find ${dir} -type f -name "*.jsx" -o -name "*.js"`).toString().split('\n').filter(Boolean);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      patterns.forEach(p => {
        const matches = content.match(p.regex);
        if (matches) {
          if (!issues[file]) issues[file] = {};
          if (!issues[file][p.name]) issues[file][p.name] = [];
          issues[file][p.name].push(...matches);
        }
      });
    });
  } catch (e) {
    console.error(`Error scanning ${dir}:`, e.message);
  }
});

for (const [file, fileIssues] of Object.entries(issues)) {
  console.log(`\n📄 ${file}`);
  for (const [patternName, matches] of Object.entries(fileIssues)) {
    const uniqueMatches = [...new Set(matches)];
    console.log(`   - ${patternName}: ${uniqueMatches.join(', ')} (${matches.length} occurrences)`);
  }
}
