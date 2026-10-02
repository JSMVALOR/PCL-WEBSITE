const fs = require('fs');
let path = 'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find and remove lines 417 and 418
const idx417 = lines.findIndex(l => l.includes('<div className={`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 ${isEmbedded ? "p-0" : ""}`}>'));
if (idx417 !== -1) {
    // Remove the two duplicates
    lines.splice(idx417, 2);
}

// Find and remove the bogus portal string around 482
const idxDocBody = lines.findIndex(l => l.includes('</div>, document.body'));
if (idxDocBody !== -1) {
    // Remove it
    lines.splice(idxDocBody, 1);
    
    // Also we need to remove the matching extra </div> that was paired with the extra divs
    // We deleted 2 divs at the top, and 1 div at idxDocBody
    // Let's just remove two extra </div>s from the bottom of the file
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('</div>')) {
            lines.splice(i, 1);
            break;
        }
    }
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('</div>')) {
            lines.splice(i, 1);
            break;
        }
    }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed FacultyMarks.jsx JSX syntax errors');
