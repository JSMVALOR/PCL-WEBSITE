const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/className="-m-4 lg:-m-8"/g, 'className="animate-fade-in"');

fs.writeFileSync(p, c);
console.log("Fixed negative margins");
