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

  // Replace Hex Backgrounds
  content = content.replace(/dark:bg-\[\#[A-Fa-f0-9]{3,6}\]/g, 'dark:bg-themePanel'); // safe fallback, though we want to remove dark: entirely usually
  content = content.replace(/bg-black\/5 dark:bg-themePanel/g, 'bg-themeElevated');
  content = content.replace(/bg-white\/70 dark:bg-themePanel\/70 backdrop-blur-3xl saturate-\[1\.8\]/g, 'bg-themePanel shadow-sm');
  content = content.replace(/bg-themePanel dark:bg-themePanel backdrop-blur-2xl/g, 'bg-themePanel shadow-sm');
  content = content.replace(/bg-gray-50 dark:bg-themePanel/g, 'bg-themeApp');
  content = content.replace(/bg-\[\#fcfcfc\] dark:bg-themePanel/g, 'bg-themePanel');
  content = content.replace(/bg-white\/70 dark:bg-themePanel/g, 'bg-themePanel');
  
  // Replace dark:text-white and similar
  content = content.replace(/dark:text-white\/[0-9]+/g, '');
  content = content.replace(/dark:text-white/g, '');
  content = content.replace(/dark:border-white\/[0-9]+/g, '');
  content = content.replace(/dark:bg-white\/[0-9]+/g, '');
  content = content.replace(/dark:bg-black/g, '');
  content = content.replace(/dark:hover:bg-white\/[0-9]+/g, '');
  content = content.replace(/dark:hover:border-white\/[0-9]+/g, '');
  content = content.replace(/dark:text-themeText/g, '');

  // Strip generic hardcoded colors
  content = content.replace(/text-black/g, 'text-themeText');
  content = content.replace(/text-white/g, 'text-themeApp');
  content = content.replace(/border-black\/[0-9]+/g, 'border-themeBorder');
  content = content.replace(/border-black\/\[[0-9\.]+\]/g, 'border-themeBorder');
  content = content.replace(/bg-black\/5/g, 'bg-themeElevated');
  content = content.replace(/bg-gray-50/g, 'bg-themeApp');
  
  // Clean up Double spaces left by stripping
  content = content.replace(/  +/g, ' ');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});
