const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
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
    try {
 await supabase.from('assignments').delete().eq('id', id);
 setAssignments(prev => prev.filter(a => a.id !== id));
 } catch (error) {
 console.error("Error deleting:", error);
 }
 };`,
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
 };`
);

fs.writeFileSync(p, c);
console.log("Delete logic fixed");
