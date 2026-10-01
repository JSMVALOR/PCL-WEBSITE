const fs = require('fs');
const glob = require('glob');

const files = glob.sync('Frontend/**/*.{jsx,js}');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/bg-themeAccent text-themeText/g, 'bg-themeAccent text-themeApp');
    content = content.replace(/bg-themeAccent text-black/g, 'bg-themeAccent text-white');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
