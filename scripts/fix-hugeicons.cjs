const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, '../node_modules/@hugeicons/core-free-icons/dist/esm/index.js');
const indexCjsFile = path.join(__dirname, '../node_modules/@hugeicons/core-free-icons/dist/cjs/index.js');

try {
  if (fs.existsSync(indexFile)) {
    let content = fs.readFileSync(indexFile, 'utf8');
    content = content.replace(/from '\.\/Grid(\d)x(\d)/g, "from './Grid$1X$2");
    fs.writeFileSync(indexFile, content);
    console.log("Fixed ESM hugeicons imports");
  }
  if (fs.existsSync(indexCjsFile)) {
    let content = fs.readFileSync(indexCjsFile, 'utf8');
    content = content.replace(/require\('\.\/Grid(\d)x(\d)/g, "require('./Grid$1X$2");
    fs.writeFileSync(indexCjsFile, content);
    console.log("Fixed CJS hugeicons imports");
  }
} catch (e) {
  console.error("Failed to fix hugeicons:", e);
}
