const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

const readyToGradeStr = `<div className="w-full py-16 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-themeBorder border-dashed">
        <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
        <h3 className="text-lg lg:text-xl text-themeText font-black">Ready to Grade</h3>
        <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Select a Subject, Batch, and Assessment Type above to load the grading roster.</p>
    </div>`;

const subjectsGridStr = `{!selectedSubject ? (
        <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-themeTextSec ml-1">Your Assigned Subjects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjects.map(sub => (
                    <button type="button" key={sub.id || sub.master_id} onClick={() => {
                        setSelectedSubject(sub.master_id || sub.id);
                        if (sub.batch_name) setSelectedBatch(sub.batch_name);
                    }} className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 text-left cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group flex flex-col gap-4">
                        <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-amber-500/10 group-hover:text-amber-500">
                            <i className="fa-solid fa-book-open text-xl"></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-themeText leading-tight">{sub.name}</h4>
                            <p className="text-xs font-bold text-themeTextSec mt-1">{sub.code}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-auto text-themeTextSec opacity-70 group-hover:opacity-100 group-hover:text-amber-500 transition-colors pt-2">
                            <span className="text-[11px] font-bold tracking-widest uppercase">Open Ledger <i className="fa-solid fa-arrow-right ml-1 -rotate-45 group-hover:rotate-0 transition-transform"></i></span>
                        </div>
                    </button>
                ))}
            </div>
            {subjects.length === 0 && (
                <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-themeBorder border-dashed">
                    <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
                    <h3 className="text-lg lg:text-xl text-themeText font-black">No Subjects Found</h3>
                    <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">You don't have any subjects assigned to you for grading.</p>
                </div>
            )}
        </div>
    ) : (
        <div className="w-full py-12 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-themeBorder border-dashed">
            <i className="fa-solid fa-clipboard-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
            <h3 className="text-lg lg:text-xl text-themeText font-black">Ready to Grade</h3>
            <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Select a Batch and Assessment Type above to load the grading roster.</p>
        </div>
    )}`;

code = code.replace(readyToGradeStr, subjectsGridStr);
fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Patched subjects cards in FacultyMarks');
