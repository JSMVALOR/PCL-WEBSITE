const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx', 'utf8');

file = file.replace(
    /<div onClick=\{\(\) => setActiveModal\('marks'\)\} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel\/70 backdrop-blur-3xl saturate-\[1\.8\] border border-themeBorder rounded-\[24px\] p-6 cursor-pointer hover:border-\[#34C759\]\/30 transition-colors flex flex-col gap-4 relative group">[\s\S]*?Current CGPA<\/span>\s*<\/div>\s*<\/div>/,
    `<div onClick={() => setActiveModal('marks')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[20px] p-4 cursor-pointer hover:border-[#34C759]/30 transition-colors flex flex-row items-center gap-4 relative group">
        <div className="w-12 h-12 rounded-[16px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0"><i className="fa-solid fa-graduation-cap text-xl"></i></div>
        <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight leading-none mb-1">{(studentData.cgpa || 0).toFixed(2)}</span>
            <span className="text-xs font-medium text-themeTextSec uppercase tracking-wider">Current CGPA</span>
        </div>
        <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all ml-auto"></i>
    </div>`
);

file = file.replace(
    /<div onClick=\{\(\) => setActiveModal\('leaves'\)\} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel\/70 backdrop-blur-3xl saturate-\[1\.8\] border border-themeBorder rounded-\[24px\] p-6 cursor-pointer hover:border-\[#FF9500\]\/30 transition-colors flex flex-col gap-4 relative group">[\s\S]*?Active Leaves<\/span>\s*<\/div>\s*<\/div>/,
    `<div onClick={() => setActiveModal('leaves')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[20px] p-4 cursor-pointer hover:border-[#FF9500]/30 transition-colors flex flex-row items-center gap-4 relative group">
        <div className="w-12 h-12 rounded-[16px] bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center shrink-0"><i className="fa-solid fa-plane-departure text-xl"></i></div>
        <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight leading-none mb-1">{activeLeaves}</span>
            <span className="text-xs font-medium text-themeTextSec uppercase tracking-wider">Active Leaves</span>
        </div>
        <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all ml-auto"></i>
    </div>`
);

file = file.replace(
    /<div onClick=\{\(\) => setActiveModal\('fees'\)\} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel\/70 backdrop-blur-3xl saturate-\[1\.8\] border border-themeBorder rounded-\[24px\] p-6 cursor-pointer hover:border-\[#AF52DE\]\/30 transition-colors flex flex-col gap-4 relative group">[\s\S]*?Pending Dues<\/span>\s*<\/div>\s*<\/div>/,
    `<div onClick={() => setActiveModal('fees')} className="col-span-1 md:col-span-2 lg:col-span-4 bg-themePanel/70 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[20px] p-4 cursor-pointer hover:border-[#AF52DE]/30 transition-colors flex flex-row items-center gap-4 relative group">
        <div className="w-12 h-12 rounded-[16px] bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center shrink-0"><i className="fa-solid fa-file-invoice-dollar text-xl"></i></div>
        <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight leading-none mb-1">₹{pendingDues.toLocaleString('en-IN')}</span>
            <span className="text-xs font-medium text-themeTextSec uppercase tracking-wider">Pending Dues</span>
        </div>
        <i className="fa-solid fa-arrow-right text-themeTextSec opacity-0 group-hover:opacity-100 transition-all ml-auto"></i>
    </div>`
);

fs.writeFileSync('Frontend/ERP/components/Parent/ParentDashboard/ParentDashboard.jsx', file);
