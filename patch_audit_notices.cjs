const fs = require('fs');
const path = 'Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the insert
const oldInsert = `
 const { error: auditError } = await supabase.from('attendance_audit_logs').insert([{
 faculty_id: facId,
 date: selectedDate,
 admin_id: userSession.db_id,
 previous_status: previousStatus,
 new_status: newStatus,
 action_reason: auditReason
 }]);
      if (auditError) console.warn("Audit log failed, table might be missing:", auditError);
`;

const newInsert = `
 const auditNoticeId = \`AUDIT-\${Date.now()}\`;
 const { error: auditError } = await supabase.from('notices').insert([{
 notice_id: auditNoticeId,
 title: \`Override: \${previousStatus.toUpperCase()} ➔ \${newStatus.toUpperCase()} (\${selectedDate})\`,
 category: 'Audit',
 target_audience: 'faculty_attendance',
 target_id: facId,
 content: auditReason || 'No reason provided.',
 author_name: userSession?.full_name || 'Admin',
 author_id: userSession?.db_id
 }]);
 if (auditError) console.warn("Audit log failed:", auditError);
`;
content = content.replace(oldInsert, newInsert);

// Replace fetchAuditHistory
const oldFetch = `
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

const newFetch = `
 const fetchAuditHistory = async (facultyId) => {
 try {
 const { data, error } = await supabase
 .from('notices')
 .select('*')
 .eq('category', 'Audit')
 .eq('target_audience', 'faculty_attendance')
 .eq('target_id', facultyId)
 .order('created_at', { ascending: false })
 .limit(10);
 
 if (error) {
    console.error("Audit history error:", error);
    if (window.erpToast) window.erpToast.show("Failed to load history.", "error");
    return;
 }
 
 if(data) {
    // Map notice fields back to expected format for the UI
    const enrichedData = data.map(d => {
        let newStatus = 'present';
        if (d.title.includes('➔ ABSENT')) newStatus = 'absent';
        if (d.title.includes('➔ EXEMPTED')) newStatus = 'exempted';
        
        return {
            id: d.id,
            admin: { full_name: d.author_name || 'Admin' },
            created_at: d.created_at,
            new_status: newStatus,
            action_reason: d.content
        };
    });
    setAuditHistory(enrichedData);
    setShowHistoryModal(true);
 }
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
`;
content = content.replace(oldFetch, newFetch);

fs.writeFileSync(path, content);
console.log('Patched AdminFacultyAttendance to use notices table for audits');
