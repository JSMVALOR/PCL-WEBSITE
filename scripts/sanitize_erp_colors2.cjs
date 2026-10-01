const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('Frontend/ERP', file => {
  if (!file.endsWith('.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/bg-white dark:bg-themePanel/g, 'bg-themePanel');
  content = content.replace(/bg-white/g, 'bg-themePanel'); // In ERP, bg-white should almost always be bg-themePanel
  
  // Clean up
  content = content.replace(/text-themeText text-themeApp/g, 'text-themeText'); // Accidental double replacement
  content = content.replace(/border border-themeBorder border-themeBorder/g, 'border border-themeBorder');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});
