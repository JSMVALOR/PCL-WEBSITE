const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /type="datetime-local"\s*className="([^"]+)"/,
    `type="date"
    className="$1 cursor-pointer"
    onClick={(e) => e.target.showPicker && e.target.showPicker()}
    onKeyDown={(e) => e.preventDefault()}`
);

// We also need to fix the outline color when focused. Notice it has a purple outline in the screenshot (browser default).
// We should add focus:ring-0 to kill the default outline so our amber border shows.
c = c.replace(
    /outline-none focus:border-amber-500/g,
    `outline-none focus:ring-0 focus:border-amber-500`
);

fs.writeFileSync(p, c);
console.log("Patched date picker in Assignments.");
