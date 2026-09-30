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

  content = content.replace(/bg-white\/60 dark:bg-themePanel\/60 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\]/g, 'bg-themePanel shadow-sm border border-themeBorder');
  content = content.replace(/bg-white\/40 dark:bg-white\/5 backdrop-blur-3xl saturate-\[1\.8\] shadow-sm hover:shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:hover:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] hover:border-black\/10 dark:hover:border-white\/20/g, 'bg-themeElevated shadow-sm hover:shadow-md border border-themeBorder hover:border-themeAccent/30');

  content = content.replace(/bg-black\/5 dark:bg-white\/10 backdrop-blur-md rounded-2xl border border-black\/10 dark:border-white\/20/g, 'bg-themeElevated rounded-2xl border border-themeBorder');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
  }
});
