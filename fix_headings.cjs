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

            // 1. Fix heading fonts
            const h1Regex = /(<motion\.h1[^>]*className=["'])([^"']*)(["'][^>]*>)/g;
            content = content.replace(h1Regex, (match, p1, p2, p3) => {
                if (!p2.includes('font-serif')) {
                    let newClasses = p2.replace(/\bfont-bold\b|\bfont-black\b/g, '').trim();
                    newClasses = newClasses + ' font-serif tracking-tight font-bold';
                    modified = true;
                    return p1 + newClasses + p3;
                }
                return match;
            });

            const h1Reg = /(<h1[^>]*className=["'])([^"']*)(["'][^>]*>)/g;
            content = content.replace(h1Reg, (match, p1, p2, p3) => {
                if (!p2.includes('font-serif')) {
                    let newClasses = p2.replace(/\bfont-bold\b|\bfont-black\b/g, '').trim();
                    newClasses = newClasses + ' font-serif tracking-tight font-bold';
                    modified = true;
                    return p1 + newClasses + p3;
                }
                return match;
            });

            // 2. Standardize top padding classes in the wrapper divs
            // We want exactly: pt-[160px] md:pt-[200px] pb-[100px] md:pb-[140px]
            // We'll look for strings containing "pt-32", "pt-40", etc., but ONLY in divs 
            // that look like a main layout wrapper. Let's just blindly replace 
            // high padding values if they exist, to ensure uniformity.
            
            // Or better, let's just do a string replace on common top paddings:
            // "pt-32", "pt-40", "pt-[120px]", "pt-[160px]" -> "pt-[160px]"
            // "md:pt-40", "md:pt-[160px]", "md:pt-48" -> "md:pt-[200px]"
            // "pb-24", "pb-32", "pb-[100px]" -> "pb-[100px]"
            // "md:pb-32", "md:pb-40" -> "md:pb-[140px]"
            
            let originalContent = content;
            
            // First pass: remove all existing high padding
            content = content.replace(/\bpt-32\b/g, 'pt-[160px]')
                             .replace(/\bpt-40\b/g, 'pt-[160px]')
                             .replace(/\bpt-48\b/g, 'pt-[160px]')
                             .replace(/\bpt-\[120px\]\b/g, 'pt-[160px]')
                             .replace(/\bmd:pt-40\b/g, 'md:pt-[200px]')
                             .replace(/\bmd:pt-48\b/g, 'md:pt-[200px]')
                             .replace(/\bmd:pt-\[160px\]\b/g, 'md:pt-[200px]')
                             
                             .replace(/\bpb-12\b/g, 'pb-[100px]')
                             .replace(/\bpb-24\b/g, 'pb-[100px]')
                             .replace(/\bpb-32\b/g, 'pb-[100px]')
                             .replace(/\bmd:pb-32\b/g, 'md:pb-[140px]');
                             
            if (content !== originalContent) modified = true;

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated:', fullPath);
            }
        }
    });
}

processDir('Frontend/Website/components/NAVBAR');
