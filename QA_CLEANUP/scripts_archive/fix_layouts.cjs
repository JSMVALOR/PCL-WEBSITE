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

let filesModified = 0;

walkDir('src/ERP', (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    // Replace double w-full
    content = content.replace(/w-full w-full/g, 'w-full');
    
    // Inject max-w constraint if it's missing on the main wrapper
    content = content.replace(
        /className=(["'\{`])(.*?)w-full mx-auto flex flex-col(.*?)pb-12(.*?)(["'\}`])/g, 
        'className=$1$2w-full max-w-[1800px] mx-auto flex flex-col$3pb-32 xl:pb-8$4$5'
    );
    
    content = content.replace(
        /className=(["'\{`])(.*?)w-full mx-auto flex flex-col(.*?)pb-16(.*?)(["'\}`])/g, 
        'className=$1$2w-full max-w-[1800px] mx-auto flex flex-col$3pb-32 xl:pb-8$4$5'
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        filesModified++;
    }
});

console.log(`Layout constraints patched on ${filesModified} pages.`);
