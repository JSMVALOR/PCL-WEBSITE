const fs = require('fs');
const glob = require('glob'); // Not available by default, I'll use standard fs walk

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = dir + '/' + f;
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

let modified = 0;
walkDir('src/ERP', (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let orig = content;
    
    // Replace rounded-[2rem] inside toggle wrappers
    content = content.replace(/rounded-\[2rem\] w-full lg:w-auto/g, 'rounded-2xl w-full lg:w-auto');
    content = content.replace(/rounded-\[2rem\] w-full lg:w-fit/g, 'rounded-2xl w-full lg:w-fit');
    
    // Specifically looking for the rightContent toggle wrapper pattern
    content = content.replace(/className="flex p-1\.5 (.*?) rounded-\[2rem\](.*?) overflow-x-auto/g, 'className="flex p-1.5 $1 rounded-2xl$2 overflow-x-auto');

    // Make sure inner buttons are rounded-xl or rounded-lg, not rounded-full (pill)
    // Sometimes buttons look like: rounded-full px-4 lg:px-6
    content = content.replace(/className=\{\`(flex-1 lg:flex-none px-4 lg:px-6 py-2\.5) rounded-full/g, 'className={`$1 rounded-lg');

    // Specific to the active indicator dot:
    // It's a small dot <span className="w-2 h-2 rounded-full... That should stay rounded-full! So we only replace large buttons.

    if (content !== orig) {
        fs.writeFileSync(filePath, content);
        modified++;
    }
});

console.log("Replaced pills with rounded-2xl toggles in " + modified + " files.");
