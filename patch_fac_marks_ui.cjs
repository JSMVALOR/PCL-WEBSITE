const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let c = fs.readFileSync(p, 'utf8');

const oldTargetBatchHTML = `<div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedBatch}
 onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
 >
 <option value="">Select Batch</option>
 {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
 </select>
 </div>`;

const newTargetBatchHTML = `{!subjectContext && (
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
 <select 
 className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors appearance-none"
 value={selectedBatch}
 onChange={(e) => { setSelectedBatch(e.target.value); setSelectedAssessmentType(""); }}
 >
 <option value="">Select Batch</option>
 {availableBatches.map(b => <option key={b} value={b}>{b}</option>)}
 </select>
 </div>
 )}`;

c = c.replace(oldTargetBatchHTML, newTargetBatchHTML);
fs.writeFileSync(p, c);
console.log("Patched Target Batch UI logic.");
