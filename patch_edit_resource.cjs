const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add editing handling to `handleAddResource`
c = c.replace(
    `const { data, error } = await supabase.from('course_resources').insert({ faculty_id: userSession.db_id, cohort_subject_id: selectedCourse.id,
 title: formData.title, url: formData.url, type: formData.type
 }).select();
 if (error) throw error;
 setResources([data[0], ...resources]);`,
    `let data, error;
        if (formData.id) {
            const res = await supabase.from('course_resources').update({
                title: formData.title, url: formData.url, type: formData.type
            }).eq('id', formData.id).select();
            data = res.data;
            error = res.error;
            if (error) throw error;
            setResources(resources.map(r => r.id === formData.id ? data[0] : r));
        } else {
            const res = await supabase.from('course_resources').insert({ faculty_id: userSession.db_id, cohort_subject_id: selectedCourse.id,
                title: formData.title, url: formData.url, type: formData.type
            }).select();
            data = res.data;
            error = res.error;
            if (error) throw error;
            setResources([data[0], ...resources]);
        }`
);

// 2. Clear formData.id when closing form (or add it when clicking edit)
c = c.replace(
    `setFormData({ title: "", url: "", type: "Drive Link" });`,
    `setFormData({ id: null, title: "", url: "", type: "Drive Link" });`
);

// 3. Fix the "null" text in HoldButton and add an Edit button right beside it.
// Original HTML:
const originalHTML = `<HoldButton size="sm" onHold={() => handleDeleteResource(res.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                null
            </HoldButton>`;

const newHTML = `<div className="flex flex-row items-center gap-2">
                <button 
                    onClick={() => {
                        setFormData({ id: res.id, title: res.title, url: res.url, type: res.type });
                        setShowResourceForm(true);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-[#007AFF]/10 text-[#8E8E93] hover:text-[#007AFF] transition"
                >
                    <i className="fa-solid fa-pen text-sm"></i>
                </button>
                <HoldButton size="sm" onHold={() => handleDeleteResource(res.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
                    {null}
                </HoldButton>
            </div>`;

c = c.replace(originalHTML, newHTML);

// 4. Update the add button text and form title if in edit mode
c = c.replace(
    `<h3 className="text-sm font-bold text-[#1C1C1E] dark:text-[#F2F2F7]">Add New Resource</h3>`,
    `<h3 className="text-sm font-bold text-[#1C1C1E] dark:text-[#F2F2F7]">{formData.id ? 'Edit Resource' : 'Add New Resource'}</h3>`
);

c = c.replace(
    `<button type="submit" disabled={isSubmitting} className="btn-erp">
 {isSubmitting ? 'Saving...' : 'Add Link'}
 </button>`,
    `<button type="submit" disabled={isSubmitting} className="btn-erp">
 {isSubmitting ? 'Saving...' : (formData.id ? 'Save Changes' : 'Add Link')}
 </button>`
);

c = c.replace(
    `const [formData, setFormData] = useState({ title: "", url: "", type: "Drive Link" });`,
    `const [formData, setFormData] = useState({ id: null, title: "", url: "", type: "Drive Link" });`
);

// 5. Add a cancel button to the form
c = c.replace(
    `<form onSubmit={handleAddResource} className="bg-themeApp border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4">`,
    `<form onSubmit={handleAddResource} className="bg-themeApp border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative">
        <button type="button" onClick={() => { setShowResourceForm(false); setFormData({ id: null, title: "", url: "", type: "Drive Link" }); }} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#8E8E93]">
            <i className="fa-solid fa-xmark text-xs"></i>
        </button>`
);


fs.writeFileSync(p, c);
console.log("Added edit functionality for Course Resources.");
