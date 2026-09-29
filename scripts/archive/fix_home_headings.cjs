const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix heading fonts (h1, h2, h3, motion.h1, motion.h2, motion.h3)
            // But only if they have font-bold or font-black, and no font-serif
            
            const headingsRegex = /(<motion\.h[1-3][^>]*className=["'])([^"']*)(["'][^>]*>)/g;
            content = content.replace(headingsRegex, (match, p1, p2, p3) => {
                // If it looks like a major section heading (has text-3xl or larger)
                if (!p2.includes('font-serif') && p2.match(/text-\d+xl|text-\[\d+px\]|text-\[\d+(\.\d+)?rem\]/)) {
                    let newClasses = p2.replace(/\bfont-bold\b|\bfont-black\b/g, '').trim();
                    newClasses = newClasses + ' font-serif tracking-tight font-bold';
                    modified = true;
                    return p1 + newClasses + p3;
                }
                return match;
            });

            const stdHeadingsRegex = /(<h[1-3][^>]*className=["'])([^"']*)(["'][^>]*>)/g;
            content = content.replace(stdHeadingsRegex, (match, p1, p2, p3) => {
                if (!p2.includes('font-serif') && p2.match(/text-\d+xl|text-\[\d+px\]|text-\[\d+(\.\d+)?rem\]/)) {
                    let newClasses = p2.replace(/\bfont-bold\b|\bfont-black\b/g, '').trim();
                    newClasses = newClasses + ' font-serif tracking-tight font-bold';
                    modified = true;
                    return p1 + newClasses + p3;
                }
                return match;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated:', fullPath);
            }
        }
    });
}

processDir('Frontend/Website/components/HOME');
