const fs = require('fs');

try {
    let faPath = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
    let fa = fs.readFileSync(faPath, 'utf8');

    // Button replacement
    const oldBtn = `<button type="button" 
 onClick={() => setShowForm(!showForm)}
 className={\`px-6 py-3 w-fit rounded-xl text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 \${showForm ? "bg-neutral-600" : ""}\`} style={{ backgroundColor: !showForm ? tColor.primary : undefined }}
 >`;
    const newBtn = `<button type="button" 
 onClick={() => setShowForm(!showForm)}
 className={\`px-6 py-3 w-fit rounded-2xl text-[13px] font-bold tracking-tight transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 \${showForm ? "bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-black/20 dark:hover:bg-white/20 shadow-none" : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-900/20 dark:shadow-white/20 hover:scale-105"}\`}
 >`;
    fa = fa.replace(oldBtn, newBtn);

    // Empty state replacement
    const oldEmpty = `<div className="w-full py-20 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 border-dashed">
 <i className="fa-solid fa-folder-open text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-gray-900 dark:text-white font-black">No Assignments Issued</h3>
 <p className="text-xs lg:text-sm text-gray-500 dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">You haven't created any offline assignments yet.</p>
 </div>`;
    const newEmpty = `<div className="w-full py-24 flex flex-col items-center justify-center bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.02] dark:to-transparent rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 shadow-inner">
 <div className="w-20 h-20 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/50 border border-black/5 dark:border-white/10 flex items-center justify-center mb-6">
    <i className="fa-solid fa-file-signature text-3xl bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent"></i>
 </div>
 <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">No Assignments Issued</h3>
 <p className="text-sm text-gray-500 dark:text-white/50 font-medium mt-2 max-w-xs mx-auto leading-relaxed">Publish new coursework to see it tracked here globally across the ERP.</p>
 </div>`;
    fa = fa.replace(oldEmpty, newEmpty);
    fs.writeFileSync(faPath, fa);
    console.log("FacultyAssignments updated.");

    let fcPath = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
    let fc = fs.readFileSync(fcPath, 'utf8');

    fc = fc.replace('<h2 className="text-[12px] font-bold tracking-tight text-[#8E8E93]">Your Active Subjects</h2>', '<h2 className="text-[11px] font-black uppercase tracking-widest text-[#8E8E93] mb-3 px-2">Assigned Subjects</h2>');

    const oldCardClass = 'border ${selectedCourse?.id === sub.id ? \'border-[#007AFF] bg-white dark:bg-[#1C1C1E] shadow-sm\' : \'border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10\'}';
    const newCardClass = 'border ${selectedCourse?.id === sub.id ? \'border-gray-900/20 dark:border-white/20 bg-white dark:bg-[#1A1A1C] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] scale-[1.02] z-10\' : \'border-black/5 dark:border-white/5 bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100\'}';
    fc = fc.replace(oldCardClass, newCardClass);

    const oldStats = `<div className="flex bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 divide-x divide-black/5 dark:divide-white/5">`;
    const newStats = `<div className="flex bg-transparent rounded-xl border-t border-black/5 dark:border-white/5 divide-x divide-black/5 dark:divide-white/5 mt-4 pt-3">`;
    fc = fc.replace(oldStats, newStats);

    const oldHeader = `<div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-sm">
 <i className="fa-solid fa-graduation-cap"></i>
 </div>
 <span className="text-[11px] font-black tracking-tight text-[#8E8E93] bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full uppercase">{selectedCourse.code}</span>
 </div>
 <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-[#1C1C1E] dark:text-[#F2F2F7] leading-tight mb-8">
 {selectedCourse.name}
 </h2>`;
    const newHeader = `<div className="relative overflow-hidden rounded-[2rem] bg-gray-900 dark:bg-white mb-8 shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(255,255,255,0.05)] border border-black/10 dark:border-white/10 group">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent mix-blend-overlay"></div>
 <div className="relative p-8 lg:p-10 flex flex-col justify-end min-h-[220px]">
    <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 dark:bg-black/10 backdrop-blur-xl text-white dark:text-gray-900 flex items-center justify-center text-lg shadow-inner border border-white/20 dark:border-black/10">
            <i className="fa-solid fa-graduation-cap"></i>
        </div>
        <span className="text-[11px] font-bold tracking-widest text-white dark:text-gray-900 bg-white/20 dark:bg-black/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 dark:border-black/10 uppercase shadow-sm">
            {selectedCourse.code}
        </span>
    </div>
    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white dark:text-gray-900 leading-tight drop-shadow-sm max-w-2xl">
        {selectedCourse.name}
    </h2>
 </div>
 </div>`;
    fc = fc.replace(oldHeader, newHeader);

    const oldTabs = `<div className="flex flex-wrap items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5 mb-8">`;
    const newTabs = `<div className="flex flex-wrap items-center bg-black/5 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-black/5 dark:border-white/5 mb-8 shadow-inner overflow-x-auto no-scrollbar snap-x gap-1">`;
    fc = fc.replace(oldTabs, newTabs);

    const oldTabBtnActive = 'border-[#007AFF] text-[#007AFF] bg-white dark:bg-[#1C1C1E] shadow-sm';
    const newTabBtnActive = 'border-transparent text-gray-900 dark:text-white bg-white dark:bg-[#2C2C2E] shadow-[0_4px_20px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] z-10 rounded-xl scale-[1.02]';
    fc = fc.split(oldTabBtnActive).join(newTabBtnActive);
    
    // Also change the default flex-1 min-w-[120px] py-2.5 rounded-xl to py-3
    fc = fc.split('py-2.5 rounded-xl').join('py-3 rounded-[14px]');

    fs.writeFileSync(fcPath, fc);
    console.log("FacultyCourses updated.");

} catch (err) {
    console.error(err);
}
