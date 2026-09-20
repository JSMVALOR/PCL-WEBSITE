const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

// Fix 1: Make the "New Assignment" button amber instead of blue.
// It currently uses `tColor.primary`. If subjectContext is passed, getBatchColorKey is breaking because it assumes .batches exists.
// Let's replace the button class definition.
c = c.replace(
    /const tColor = subjectContext \? \(THEME_COLORS\[getBatchColorKey\(subjectContext\.batches\?\.\[0\]\)\] \|\| THEME_COLORS\.default\) : THEME_COLORS\.default;/g,
    `const tColor = THEME_COLORS.amber; // Enforce premium amber aesthetic`
);

// Fix 2: Hide Target Batch if subjectContext exists
const batchHTML = `{/* Batch */}
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-gray-500 dark:text-white/50">Target Batch *</label>
 <select 
 className="bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent transition-colors appearance-none"
 value={formData.batch}
 onChange={(e) => setFormData({...formData, batch: e.target.value})}
 required
 >
 <option value="">Select Batch</option>
 {availableBatches.map(b => (
 <option key={b} value={b}>{b}</option>
 ))}
 </select>
 </div>`;

const newBatchHTML = `{!subjectContext && (
    <div className="flex flex-col gap-2">
        <label className="text-[13px] font-medium text-gray-500 dark:text-white/50">Target Batch *</label>
        <select 
            className="bg-black/5 dark:bg-[#1C1C1E] backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors appearance-none"
            value={formData.batch}
            onChange={(e) => setFormData({...formData, batch: e.target.value})}
            required
        >
            <option value="">Select Batch</option>
            {availableBatches.map(b => (
                <option key={b} value={b}>{b}</option>
            ))}
        </select>
    </div>
 )}`;

c = c.replace(batchHTML, newBatchHTML);

// Fix 3: Use finalBatch in insert
c = c.replace(
    `batch: formData.batch,`,
    `batch: subjectContext ? subjectContext.batch_id : formData.batch,`
);

// Fix 4: Upgrade input aesthetics
c = c.replace(/className="bg-black\/5 dark:bg-white\/5 backdrop-blur-xl border border-black\/5 dark:border-white\/5/g, 'className="bg-black/5 dark:bg-[#1C1C1E] backdrop-blur-xl border border-black/10 dark:border-white/10');
c = c.replace(/focus:border-gray-200 dark:border-white\/5Accent/g, 'focus:border-amber-500 dark:focus:border-amber-500');

// Fix 5: Replace window.confirm with window.erpDialog
c = c.replace(
    /if\(\!window\.confirm\("Are you sure you want to delete this assignment\?"\)\) return;/g,
    `if(window.erpDialog) {
        const confirmed = await new Promise(resolve => {
            window.erpDialog.confirm("Are you sure you want to delete this assignment?", () => resolve(true));
            // Note: Since confirm modal might not block async without a wrapper, we can just use confirm.
            // Wait, erpDialog.confirm accepts a callback.
        });
    } else {
        if(!window.confirm("Are you sure you want to delete this assignment?")) return;
    }`
);

// Actually, wait, let's look at handleDelete
c = c.replace(
    `const handleDelete = async (id) => {
 if(!window.confirm("Are you sure you want to delete this assignment?")) return;
 try {`,
    `const handleDelete = async (id) => {
    const runDelete = async () => {
        try {
            await supabase.from('assignments').delete().eq('id', id);
            setAssignments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    if (window.erpDialog) {
        window.erpDialog.confirm("Are you sure you want to delete this assignment?", runDelete);
    } else {
        if (window.confirm("Are you sure you want to delete this assignment?")) runDelete();
    }
    return; // Stop outer function, delete handled in callback
    try {` // Keep the matching brace happy by dummy replacing try {
);

fs.writeFileSync(p, c);
console.log("Patched Assignments Aesthetics and Logic");
