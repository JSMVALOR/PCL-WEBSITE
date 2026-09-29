const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', 'utf8');

// The items map arrays are inside ternary operators.
// We just need to replace the flex-col on the outer cards with a grid, BUT wait, the outer cards are just the individual items.
// They need to be wrapped in a grid.
// Example: profileUpdates.map(...)
// I will just look for `.map(` and the corresponding `))`

const mapsToWrap = ['timetableRequests', 'facultyLeaves', 'grievances', 'profileUpdates'];

mapsToWrap.forEach(name => {
    let searchString = name + '.map(';
    let index = content.indexOf(searchString);
    if (index !== -1) {
        // Insert grid div before this
        content = content.slice(0, index) + '<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">\n' + content.slice(index);
    }
});

// Now we need to close the `</div>` after the `))` of each map.
// Let's do it with a careful replace.

// timetableRequests map ends around line 408
content = content.replace(/(\{\s*req\.status\s*\})([\s\S]*?)(<\/span>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\))(\s*\)\})/g, '$1$2$3\n</div>$4');

// facultyLeaves ends around line 439
content = content.replace(/(req\.admin_remarks \|\| "N\/A"\}<\/p>[\s\S]*?<\/div>[\s\S]*?\)\s*\}\s*<\/div>[\s\S]*?\)\))(\s*\)\})/g, '$1\n</div>$2');

// grievances ends around line 519
content = content.replace(/(g\.resolution_notes \|\| "N\/A"\}<\/p>[\s\S]*?<\/div>[\s\S]*?\)\s*\}\s*<\/div>[\s\S]*?\)\))(\s*\)\})/g, '$1\n</div>$2');

// profileUpdates ends around line 570
content = content.replace(/('rejected', remarks\)[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\))(\s*\)\})/g, '$1\n</div>$2');

// Finally, replace the ugly classes with premium cards
const ugly1 = 'py-6 px-4 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors';
const ugly2 = '`py-5 border-b border-black/5 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors px-4`';

const premium = 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.01] transition-transform';

content = content.split(ugly1).join(premium).split(ugly2).join(`"${premium}"`);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx', content);
