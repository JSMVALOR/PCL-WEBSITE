const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.jsx') || f.endsWith('.js') || f.endsWith('.tsx') || f.endsWith('.ts')) {
            callback(path.join(dir, f));
        }
    });
}

const targetStr = 'if (window.toast) window.toast.error("An error occurred. Please try again."); }';

let totalFixed = 0;

walkDir('./Frontend', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // The script fix_ui.cjs likely replaced `.catch(err => ...)` with `} catch(err) { ... }` 
    // leaving behind `)` or `);` or `); }` etc.
    
    // Fix: } catch (error) { ... } ); -> } catch (error) { ... }
    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\)\)/g, 
                             '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }');
                             
    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\)\;/g, 
                             '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }');
                             
    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\`/g, 
                             '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }`');

    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\}\)/g, 
                             '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }');

    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\}\;/g, 
                             '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }');

    // ProfileEditModal.jsx has `}`);`
    content = content.replace(/\} catch \(([^)]+)\) \{ console\.error\(\1\); if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \}\}\`\)\;/g, 
                             '} catch ($1) { console.error($1); if (window.toast) window.toast.error("An error occurred. Please try again."); }`');

    // Let's do a more robust regex:
    // Match `} catch(err) { ... }` followed by stray characters like `);`, `)`, `));`, `}`);`
    content = content.replace(/(if \(window\.toast\) window\.toast\.error\("An error occurred\. Please try again\."\); \})([);}`]+)/g, (match, p1, p2) => {
        // We only want to remove closing parens/semicolons that don't belong.
        // Wait, what if the `}` belonged to a template literal `${ ... }`?
        if (p2.includes('`')) return p1 + '`'; 
        return p1; 
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixed++;
        console.log(`Fixed ${filePath}`);
    }
});

console.log(`Total files fixed: ${totalFixed}`);
