import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# 1. Add getLocalDateString helper
helper = """
const getLocalDateString = (d) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
"""
# insert it right before FacultyAttendance component
content = content.replace("export default function FacultyAttendance", helper + "\nexport default function FacultyAttendance")

# 2. Replace the date strings
content = content.replace("dateObj.toISOString().split('T')[0]", "getLocalDateString(dateObj)")
content = content.replace("new Date().toISOString().split('T')[0]", "getLocalDateString(new Date())")
content = content.replace("d.toISOString().split('T')[0]", "getLocalDateString(d)")

# 3. Update handleCloseSession
old_close = """ const handleCloseSession = async () => {
 try {
 await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id);
 
 setActiveSession(null);
 setEnrolledStudents([]);
 setAttendanceRecords({});
 setActiveTab("today");
 fetchTodayClasses();
 } catch (error) {"""

new_close = """ const handleCloseSession = async () => {
 try {
 await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id);
 
 setActiveSession(null);
 setEnrolledStudents([]);
 setAttendanceRecords({});
 fetchTodayClasses();
 fetchAllSubjects(); // Refresh past classes list
 
 if (window.erpDialog) {
     window.erpDialog.alert("Session finalized and saved successfully!", "success");
 } else {
     alert("Session finalized and saved successfully!");
 }
 } catch (error) {"""

content = content.replace(old_close, new_close)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)
