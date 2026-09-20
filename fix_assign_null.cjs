const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /<HoldButton size="sm" onHold=\{\(\) => handleDelete\(assign\.id\)\} radius=\{8\} backgroundColor="rgba\(244,63,94,0\.1\)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon=\{<HugeiconsIcon icon=\{Delete02Icon\} size=\{16\} \/>\}>\s+null\s+<\/HoldButton>/g,
    `<HoldButton size="sm" onHold={() => handleDelete(assign.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>`
);

fs.writeFileSync(p, c);
console.log("Fixed null text in FacultyAssignments");
