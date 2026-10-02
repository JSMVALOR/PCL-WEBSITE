const fs = require('fs');

const path = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldEmptyState = `<div className="w-full py-16 flex flex-col items-center justify-center bg-black/[0.02] dark:bg-themePanel/[0.02] rounded-2xl text-center px-4 border border-themeBorder border-dashed">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">No Assignments Issued</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">You haven't created any offline assignments yet.</p>
 </div>`;

const newEmptyState = `<div className="w-full py-20 flex flex-col items-center justify-center bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] text-center px-4 border border-themeBorder shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden group">
  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  <div className="w-20 h-20 bg-themeElevated rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-themeBorder group-hover:scale-110 transition-transform duration-500">
      <i className="fa-solid fa-folder-open text-4xl text-themeTextSec"></i>
  </div>
  <h3 className="text-xl lg:text-2xl text-themeText font-black tracking-tight relative z-10">No Assignments Issued</h3>
  <p className="text-sm lg:text-[15px] text-themeTextSec mt-3 max-w-sm mx-auto font-medium relative z-10">You haven't created any offline assignments yet.</p>
</div>`;

content = content.replace(oldEmptyState, newEmptyState);

fs.writeFileSync(path, content);
console.log('Patched Empty State in FacultyAssignments.jsx');
