const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', 'utf8');

// Fix the flex container so scrolling works. It needs min-h-0.
file = file.replace(
    /<div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">/,
    '<div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">'
);

// Also add min-h-0 to the main wrapper just in case
file = file.replace(
    /<div className="flex-1 w-full flex flex-col bg-themeApp animate-fade-in font-sans">/,
    '<div className="flex-1 w-full flex flex-col min-h-0 bg-themeApp animate-fade-in font-sans">'
);

// Add the close button in the header
file = file.replace(
    /<span className="text-sm font-black text-emerald-500">\{stats.mailSent\}<\/span>\n <\/div>\n <\/div>\n <\/div>/,
    `<span className="text-sm font-black text-emerald-500">{stats.mailSent}</span>
 </div>
 {onClose && (
     <div className="pl-6 ml-2 border-l border-themeBorder">
         <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition flex items-center justify-center">
             <i className="fa-solid fa-xmark"></i>
         </button>
     </div>
 )}
 </div>
 </div>`
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', file);
