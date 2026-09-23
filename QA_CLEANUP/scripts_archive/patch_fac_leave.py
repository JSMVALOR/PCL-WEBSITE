import re

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'r') as f:
    content = f.read()

old_withdraw = r""" const handleWithdraw = async \(id\) => \{
 if \(!confirm\("Are you sure you want to withdraw this leave request\?"\)\) return;
 try \{
 await supabase\.from\('faculty_leaves'\)\.delete\(\)\.eq\('id', id\);
 fetchLeaveData\(\);
 if \(window\.erpDialog\) window\.erpDialog\.alert\("Leave request withdrawn successfully\.", "success"\);
 else alert\("Leave request withdrawn successfully\."\);
 \} catch \(error\) \{
 console\.error\(error\);
 \}
 \};"""

new_withdraw = """    const handleWithdraw = async (id) => {
        if (!confirm("Are you sure you want to withdraw this leave request?")) return;
        try {
            const { error } = await supabase.from('faculty_leaves').delete().eq('id', id);
            if (error) throw error;
            fetchLeaveData();
            if (window.erpDialog) window.erpDialog.alert("Leave request withdrawn successfully.", "success");
            else alert("Leave request withdrawn successfully.");
        } catch (error) {
            console.error(error);
            if (window.erpDialog) window.erpDialog.alert("Failed to withdraw: " + (error?.message || error?.details || JSON.stringify(error)));
            else alert("Failed to withdraw: " + error?.message);
        }
    };"""

content = re.sub(old_withdraw, new_withdraw, content)

with open('src/ERP/components/Faculty/FacultyLeave/FacultyLeave.jsx', 'w') as f:
    f.write(content)
