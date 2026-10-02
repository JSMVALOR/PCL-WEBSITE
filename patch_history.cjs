const fs = require('fs');

const path = 'Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldFetch = `
 const fetchAuditHistory = async (facultyId) => {
 try {
 const { data } = await supabase
 .from('attendance_audit_logs')
 .select('*, admin:admin_id(full_name)')
 .eq('faculty_id', facultyId)
 .order('created_at', { ascending: false })
 .limit(10);
 if(data) {
 setAuditHistory(data);
 setShowHistoryModal(true);
 }
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
`;

const newFetch = `
 const fetchAuditHistory = async (facultyId) => {
 try {
 const { data, error } = await supabase
 .from('attendance_audit_logs')
 .select('*')
 .eq('faculty_id', facultyId)
 .order('created_at', { ascending: false })
 .limit(10);
 
 if (error) {
    console.error("Audit history error:", error);
    if (window.erpToast) window.erpToast.show("Failed to load history.", "error");
    return;
 }
 
 if(data) {
    // Manually enrich with admin names to avoid strict FK errors
    const adminIds = [...new Set(data.map(d => d.admin_id).filter(Boolean))];
    let adminMap = {};
    if (adminIds.length > 0) {
        const { data: admins } = await supabase.from('profiles').select('id, full_name').in('id', adminIds);
        if (admins) {
            admins.forEach(a => { adminMap[a.id] = a.full_name; });
        }
    }
    
    const enrichedData = data.map(d => ({
        ...d,
        admin: { full_name: adminMap[d.admin_id] || 'Admin' }
    }));
    
    setAuditHistory(enrichedData);
    setShowHistoryModal(true);
 }
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync(path, content);
console.log('Patched AdminFacultyAttendance.jsx fetchAuditHistory');
