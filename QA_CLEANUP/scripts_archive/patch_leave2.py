import re

with open('src/ERP/components/Student/Leave/Leave.jsx', 'r') as f:
    content = f.read()

handle_withdraw = """
    const handleWithdraw = async (id) => {
        if (!window.confirm("Are you sure you want to withdraw this leave request?")) return;
        try {
            const { error } = await supabase.from('leave_requests').delete().eq('id', id);
            if (error) throw error;
            window.erpDialog?.alert("Leave request withdrawn successfully.");
            fetchLeaveHistory();
        } catch (err) {
            console.error(err);
            window.erpDialog?.alert("Failed to withdraw leave: " + (err?.message || err?.details || JSON.stringify(err)));
        }
    };

    const handleRequestSubmit = async (e) => {"""

content = content.replace(" const handleRequestSubmit = async (e) => {", handle_withdraw)

with open('src/ERP/components/Student/Leave/Leave.jsx', 'w') as f:
    f.write(content)
