const fs = require('fs');
let fp = 'src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let content = fs.readFileSync(fp, 'utf8');

const oldEmpty = `<div className="w-full py-20 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 border-dashed">
 <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText font-black">Ready to Grade</h3>
 <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Select a Subject, Batch, and Assessment Type above to load the grading roster.</p>
 </div>`;

const newEmpty = `<div className="flex flex-col gap-6 w-full animate-fade-in">
    <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-themeBorder border-dashed">
        <i className="fa-solid fa-list-check text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
        <h3 className="text-lg lg:text-xl text-themeText font-black">Ready to Grade</h3>
        <p className="text-xs lg:text-sm text-themeTextSec opacity-70 mt-2 max-w-xs mx-auto">Select a Subject, Batch, and Assessment Type above to load the grading roster.</p>
    </div>

    {selectedSubject && assignments.filter(a => a.subject_id === selectedSubject).length > 0 && (
        <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-themeBorder rounded-[2rem] p-6 lg:p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center text-lg shadow-inner border border-amber-500/20">
                    <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-themeText tracking-tight leading-tight">Quick Grade Assignments</h3>
                    <p className="text-[10px] font-bold text-themeTextSec mt-0.5 tracking-normal">Click an active assignment to auto-load the grading roster</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.filter(a => a.subject_id === selectedSubject).map(assign => (
                    <button type="button" key={assign.id} onClick={() => {
                        setSelectedBatch(assign.batch);
                        setSelectedAssessmentType(assign.id);
                    }} className="bg-themeApp border border-themeBorder rounded-2xl p-5 hover:border-themeAccent/50 hover:bg-themeAccent/5 transition-all duration-300 flex flex-col gap-3 group text-left shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)] active:scale-[0.98]">
                        <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-2">
                                <span className="bg-themeElevated px-2 py-0.5 rounded text-[10px] font-bold text-themeTextSec border border-themeBorder group-hover:border-themeAccent/30">{assign.batch}</span>
                            </div>
                            <div className="flex items-center gap-1 text-themeText text-[12px] font-bold">
                                <i className="fa-solid fa-star text-amber-500 text-[10px]"></i> {assign.total_marks}
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold tracking-tight text-themeText leading-tight">{assign.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-themeTextSec opacity-70 group-hover:opacity-100 group-hover:text-themeAccent transition-colors">
                            <span className="text-[11px] font-bold tracking-widest uppercase">Grade Now <i className="fa-solid fa-arrow-right ml-1 -rotate-45 group-hover:rotate-0 transition-transform"></i></span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )}
</div>`;

content = content.replace(oldEmpty, newEmpty);
fs.writeFileSync(fp, content);
console.log("Patched Marks Ledger Empty State");
