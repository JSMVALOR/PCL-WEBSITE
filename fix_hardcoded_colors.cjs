const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('Frontend/ERP/components', file => {
  if (!file.endsWith('.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace hardcoded card backgrounds
  content = content.replace(/bg-white dark:bg-\[\#121212\]/g, 'bg-themePanel');
  content = content.replace(/bg-gray-50 dark:bg-\[\#121212\]/g, 'bg-themeElevated');
  
  // Replace hardcoded borders
  content = content.replace(/dark:border-white\/5/g, '');
  content = content.replace(/dark:border-white\/10/g, '');
  content = content.replace(/dark:border-white\/20/g, '');
  
  // Replace hardcoded text colors
  content = content.replace(/dark:text-white\/50/g, '');
  content = content.replace(/dark:text-white\/70/g, '');
  content = content.replace(/dark:text-white/g, '');
  content = content.replace(/text-black/g, 'text-themeText');

  // Replace hardcoded hover background
  content = content.replace(/hover:border-black\/10 dark:hover:border-white\/20/g, 'hover:border-themeAccent/30');

  // Replace calendar grid empty row backgrounds (AdminNotices.jsx)
  content = content.replace(/bg-white\/50 dark:bg-white\/5/g, 'bg-themeElevated/50');
  content = content.replace(/bg-white dark:bg-[#111]/g, 'bg-themePanel');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});
