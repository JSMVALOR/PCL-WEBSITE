import re

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'r') as f:
    content = f.read()

# 1. Fix start_date -> from_date and end_date -> to_date
content = content.replace("leave.start_date", "leave.from_date")
content = content.replace("leave.end_date", "leave.to_date")
content = content.replace("l.start_date", "l.from_date")
content = content.replace("l.end_date", "l.to_date")

# 2. Inject new state variables
new_state = """    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // NEW STATES
    const [isSingleDay, setIsSingleDay] = useState(true);
    const [editingLeaveId, setEditingLeaveId] = useState(null);
"""
content = content.replace("    const [isSubmitting, setIsSubmitting] = useState(false);", new_state)

# 3. Add handleWithdraw and handleEdit before fetchLeaveData
handlers = """
    const handleWithdraw = async (id) => {
        if (!confirm("Are you sure you want to withdraw this leave request?")) return;
        try {
            await supabase.from('faculty_leaves').delete().eq('id', id);
            fetchLeaveData();
            if (window.erpDialog) window.erpDialog.alert("Leave request withdrawn successfully.", "success");
            else alert("Leave request withdrawn successfully.");
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (leave) => {
        setLeaveType(leave.leave_type);
        setFromDate(leave.from_date);
        setToDate(leave.to_date);
        setReason(leave.reason || "");
        setSubstituteId(leave.replacement_faculty_id || "");
        setIsSingleDay(leave.from_date === leave.to_date);
        setEditingLeaveId(leave.id);
        setShowRequestModal(true);
    };

    const resetForm = () => {
        setLeaveType("Casual Leave (CL)");
        setFromDate("");
        setToDate("");
        setReason("");
        setSubstituteId("");
        setIsSingleDay(true);
        setEditingLeaveId(null);
        setStatusMessage({ type: "", text: "" });
    };

    const openNewRequest = () => {
        resetForm();
        setShowRequestModal(true);
    };

"""
content = content.replace("    const fetchLeaveData = async () => {", handlers + "    const fetchLeaveData = async () => {")

# 4. Modify onClick for New Request button
content = content.replace("onClick={() => setShowRequestModal(true)}", "onClick={openNewRequest}")

# 5. Modify handleRequestSubmit logic
old_submit = """        if (!leaveType || !fromDate || !toDate || !reason) {
            setStatusMessage({ type: "error", text: "Please fill in all required fields." });
            setIsSubmitting(false);
            return;
        }"""
        
new_submit = """        const finalToDate = isSingleDay ? fromDate : toDate;
        
        if (!leaveType || !fromDate || (!isSingleDay && !toDate) || !reason) {
            setStatusMessage({ type: "error", text: "Please fill in all required fields." });
            setIsSubmitting(false);
            return;
        }"""
content = content.replace(old_submit, new_submit)

# Fix the dates used in calculation during submit
content = content.replace("const end = new Date(toDate);", "const end = new Date(finalToDate);")
content = content.replace("to_date: toDate,", "to_date: finalToDate,")
content = content.replace("new Date(toDate) - new Date(fromDate)", "new Date(finalToDate) - new Date(fromDate)")

old_insert = """            const { error } = await supabase.from('faculty_leaves').insert([payload]);"""
new_insert = """            let error;
            if (editingLeaveId) {
                const { error: updErr } = await supabase.from('faculty_leaves').update(payload).eq('id', editingLeaveId);
                error = updErr;
            } else {
                const { error: insErr } = await supabase.from('faculty_leaves').insert([payload]);
                error = insErr;
            }"""
content = content.replace(old_insert, new_insert)

content = content.replace('text: "Leave request submitted successfully."', 'text: editingLeaveId ? "Leave request updated successfully." : "Leave request submitted successfully."')

# 6. Inject the Edit/Withdraw buttons into the UI for pending leaves
old_history_item_bottom = """                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                                leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        {leave.replacement_faculty_id && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest w-20">Substitute:</span>
                                                <span className="text-xs font-bold text-themeText dark:text-white flex items-center gap-2">
                                                    <i className="fa-solid fa-user-tie text-themeTextSec"></i>
                                                    {facultyList.find(f => f.id === leave.replacement_faculty_id)?.full_name || 'Assigned'}
                                                </span>
                                            </div>
                                        )}
                                    </div>"""

new_history_item_bottom = """                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                                leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>
                                        {leave.replacement_faculty_id && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest w-20">Substitute:</span>
                                                <span className="text-xs font-bold text-themeText dark:text-white flex items-center gap-2">
                                                    <i className="fa-solid fa-user-tie text-themeTextSec"></i>
                                                    {facultyList.find(f => f.id === leave.replacement_faculty_id)?.full_name || 'Assigned'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {leave.status === 'pending' && (
                                        <div className="flex flex-col gap-2 border-l border-black/10 dark:border-white/10 pl-6 lg:ml-4">
                                            <button onClick={() => handleEdit(leave)} className="text-xs font-bold text-themeTextSec hover:text-indigo-500 transition-colors flex items-center gap-2">
                                                <i className="fa-solid fa-pen-to-square"></i> Edit
                                            </button>
                                            <button onClick={() => handleWithdraw(leave.id)} className="text-xs font-bold text-themeTextSec hover:text-rose-500 transition-colors flex items-center gap-2">
                                                <i className="fa-solid fa-trash-can"></i> Withdraw
                                            </button>
                                        </div>
                                    )}"""
content = content.replace(old_history_item_bottom, new_history_item_bottom)


# 7. Modify the date pickers
old_date_fields = """                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">Start Date</label>
                                        <input type="date" min="2024-01-01" max="2026-12-31" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition dark:[color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">End Date</label>
                                        <input type="date" min={fromDate || "2024-01-01"} max="2026-12-31" required value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition dark:[color-scheme:dark]" />
                                    </div>
                                </div>"""

new_date_fields = """                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 w-max cursor-pointer" onClick={() => setIsSingleDay(!isSingleDay)}>
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isSingleDay ? 'bg-amber-500 text-black' : 'bg-black/10 dark:bg-white/10 text-transparent'}`}>
                                            <i className="fa-solid fa-check text-xs"></i>
                                        </div>
                                        <span className="text-xs font-bold text-themeText dark:text-white">Single Day Leave / Emergency</span>
                                    </div>
                                    
                                    <div className={`grid ${isSingleDay ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">{isSingleDay ? 'Leave Date' : 'Start Date'}</label>
                                            <input type="date" min="2024-01-01" max="2026-12-31" required value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition dark:[color-scheme:dark]" />
                                        </div>
                                        {!isSingleDay && (
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50 mb-2">End Date</label>
                                                <input type="date" min={fromDate || "2024-01-01"} max="2026-12-31" required value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition dark:[color-scheme:dark]" />
                                            </div>
                                        )}
                                    </div>
                                </div>"""
content = content.replace(old_date_fields, new_date_fields)

# 8. Modify the Submit button text
content = content.replace('<><i className="fa-solid fa-paper-plane"></i> Submit Request</>', '<><i className="fa-solid fa-paper-plane"></i> {editingLeaveId ? "Update Request" : "Submit Request"}</>')
content = content.replace('<h2>New Leave Application</h2>', '<h2>{editingLeaveId ? "Edit Leave Application" : "New Leave Application"}</h2>')

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'w') as f:
    f.write(content)

