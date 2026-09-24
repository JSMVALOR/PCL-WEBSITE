const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'utf8');

// 1. Add id to formData
code = code.replace(
  `subject_id: "",
 batch: "",`,
  `id: null,
 subject_id: "",
 batch: "",`
);

code = code.replace(
  `subject_id: "",
 batch: "",
 title: "",`,
  `id: null,
 subject_id: "",
 batch: "",
 title: "",`
);

// 2. Add handleEdit button
const deleteBtnStr = `<HoldButton size="sm" onHold={() => handleDelete(assign.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>`;
const editDeleteStr = `<div className="flex gap-2">
    <button onClick={() => { setFormData({ id: assign.id, subject_id: assign.subject_id, batch: assign.batch, title: assign.title, description: assign.description, total_marks: assign.total_marks, due_date: assign.due_date }); setShowForm(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-amber-500/10 text-themeTextSec hover:text-amber-500 transition">
        <i className="fa-solid fa-pen text-xs"></i>
    </button>
    <HoldButton size="sm" onHold={() => handleDelete(assign.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>{null}</HoldButton>
</div>`;

code = code.replace(deleteBtnStr, editDeleteStr);

// 3. Update handlePublish
const insertStr = `const { error } = await supabase.from('assignments').insert({
 faculty_id: userSession.db_id,
 subject_id: finalSubjectId,
 batch: finalBatch,
 batch_id: finalBatchId,
 title: formData.title,
 description: formData.description,
 total_marks: Number(formData.total_marks),
 due_date: formData.due_date,
 status: 'active'
 });`;
 
const updateStr = `let error = null;
    if (formData.id) {
        const res = await supabase.from('assignments').update({
            title: formData.title,
            description: formData.description,
            total_marks: Number(formData.total_marks),
            due_date: formData.due_date,
            updated_at: new Date().toISOString()
        }).eq('id', formData.id);
        error = res.error;
    } else {
        const res = await supabase.from('assignments').insert({
            faculty_id: userSession.db_id,
            subject_id: finalSubjectId,
            batch: finalBatch,
            batch_id: finalBatchId,
            title: formData.title,
            description: formData.description,
            total_marks: Number(formData.total_marks),
            due_date: formData.due_date,
            status: 'active'
        });
        error = res.error;
    }`;

code = code.replace(insertStr, updateStr);

// 4. Update the card to show timestamp
const activeBadgeStr = `{isPastDue ? 'Past Due' : 'Active'}
 </span>`;

const activeBadgeReplStr = `{isPastDue ? 'Past Due' : 'Active'}
 </span>
 {assign.updated_at && <span className="text-[10px] font-bold text-themeTextSec bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded ml-2">Edited: {new Date(assign.updated_at).toLocaleDateString()} {new Date(assign.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}`;

code = code.replace(activeBadgeStr, activeBadgeReplStr);

const issueStr = `<h2 className="text-xl font-semibold tracking-tight text-themeText dark:text-white">Issue New Assignment</h2>`;
const issueStrRepl = `<h2 className="text-xl font-semibold tracking-tight text-themeText dark:text-white">{formData.id ? 'Edit Assignment' : 'Issue New Assignment'}</h2>`;
code = code.replace(issueStr, issueStrRepl);

const btnStr = `{isSubmitting ? 'Issuing...' : 'Issue Assignment'}`;
const btnStrRepl = `{isSubmitting ? 'Saving...' : (formData.id ? 'Save Changes' : 'Issue Assignment')}`;
code = code.replace(btnStr, btnStrRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', code);
console.log('Patched FacultyAssignments.jsx for edit option');
