const fs = require('fs');
let p = 'src/ERP/components/Student/Mentorship/Mentorship.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    'className="bg-white dark:bg-[#121212] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col"',
    'className="bg-white dark:bg-[#121212] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-y-auto max-h-[90vh] border border-white/[0.08] shadow-2xl flex flex-col pb-28 sm:pb-0"'
);

fs.writeFileSync(p, c);
console.log("Modal layout fixed");
