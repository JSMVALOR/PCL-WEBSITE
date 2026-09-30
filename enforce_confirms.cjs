const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('Frontend/ERP/components/Admin');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix AdminNotices
    if (file.includes('AdminNotices.jsx')) {
        const oldNoticeDelete = `const handleDeleteNotice = async (id) => {
 
 await supabase.from('notices').delete().eq('id', id);
 fetchNotices();
 };`;
        const newNoticeDelete = `const handleDeleteNotice = async (id) => {
 if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm("Are you sure you want to delete this notice?", r)))) return;
 try {
 await supabase.from('notices').delete().eq('id', id);
 fetchNotices();
 if(window.erpToast) window.erpToast.show("Notice deleted successfully.", "success");
 } catch (e) {
 if(window.erpToast) window.erpToast.show("Failed to delete notice.", "error");
 }
 };`;
        if(content.includes(oldNoticeDelete)) { content = content.replace(oldNoticeDelete, newNoticeDelete); changed = true; }

        const oldEventDelete = `const handleDeleteEvent = async (id) => {
 
 await supabase.from('academic_calendar').delete().eq('id', id);
 fetchEvents();
 };`;
        const newEventDelete = `const handleDeleteEvent = async (id) => {
 if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm("Are you sure you want to delete this event?", r)))) return;
 try {
 await supabase.from('academic_calendar').delete().eq('id', id);
 fetchEvents();
 if(window.erpToast) window.erpToast.show("Event deleted successfully.", "success");
 } catch (e) {
 if(window.erpToast) window.erpToast.show("Failed to delete event.", "error");
 }
 };`;
        if(content.includes(oldEventDelete)) { content = content.replace(oldEventDelete, newEventDelete); changed = true; }
    }

    // Fix BlogManager reject
    if (file.includes('BlogManager.jsx')) {
        const oldReject = `const handleReject = async () => {
 const actionText = currentBlog?.is_public ? "delete" : "reject and permanently delete";
 

 try {`;
        const newReject = `const handleReject = async () => {
 const actionText = currentBlog?.is_public ? "delete" : "reject and permanently delete";
 if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm(\`Are you sure you want to \${actionText} this post?\`, r)))) return;
 try {`;
        if(content.includes(oldReject)) { content = content.replace(oldReject, newReject); changed = true; }
        
        // Also fix the alerts in BlogManager
        const oldAlert1 = "window.erpDialog?.alert(`Blog ${currentBlog?.is_public ? 'deleted' : 'rejected'} and removed from database.`);";
        const newAlert1 = "if(window.erpToast) window.erpToast.show(`Blog ${currentBlog?.is_public ? 'deleted' : 'rejected'} and removed.`, 'success');";
        if(content.includes(oldAlert1)) { content = content.replace(oldAlert1, newAlert1); changed = true; }
        
        const oldAlert2 = "window.erpDialog?.alert(`Could not ${actionText} the post.`);";
        const newAlert2 = "if(window.erpToast) window.erpToast.show(`Could not ${actionText} the post.`, 'error');";
        if(content.includes(oldAlert2)) { content = content.replace(oldAlert2, newAlert2); changed = true; }
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log("Enforced confirms/toasts in: " + file);
    }
});
