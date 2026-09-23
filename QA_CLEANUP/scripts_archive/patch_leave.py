import re

with open('src/ERP/components/Student/Leave/Leave.jsx', 'r') as f:
    content = f.read()

# Add handleWithdraw method
handle_withdraw = """
    const handleWithdraw = async (id) => {
        if (!window.confirm("Are you sure you want to withdraw this leave request?")) return;
        try {
            const { error } = await window.supabase.from('leave_requests').delete().eq('id', id);
            if (error) throw error;
            window.erpDialog?.alert("Leave request withdrawn successfully.");
            fetchLeaveHistory();
        } catch (err) {
            console.error(err);
            window.erpDialog?.alert("Failed to withdraw leave: " + (err?.message || err?.details || JSON.stringify(err)));
        }
    };

    // --- SUBMISSION ENGINE ---"""

# Wait, `window.supabase` is not correct, it should be just `supabase`
handle_withdraw = handle_withdraw.replace("window.supabase", "supabase")

content = content.replace("    // --- SUBMISSION ENGINE ---", handle_withdraw)


# Add Withdraw Button to UI
target_snippet = """ {leave.document_path && (
 <button type="button" onClick={() => downloadProof(leave.document_path)} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 hover:bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20 px-3 py-2 lg:py-1.5 rounded-lg border border-black/5 dark:border-white/10 w-full lg:w-auto">
 <i className="fa-solid fa-paperclip"></i> View Proof
 </button>
 )}"""

new_snippet = target_snippet + """
 {leave.status === 'pending' && (
 <button type="button" onClick={() => handleWithdraw(leave.id)} className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-400/80 flex items-center justify-center gap-1.5 transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 lg:py-1.5 rounded-lg border border-rose-500/20 w-full lg:w-auto mt-2 lg:mt-0">
 <i className="fa-solid fa-trash-can"></i> Withdraw
 </button>
 )}"""

content = content.replace(target_snippet, new_snippet)

with open('src/ERP/components/Student/Leave/Leave.jsx', 'w') as f:
    f.write(content)
