const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

const closeFnStr = `const handleCloseSession = async () => {
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
 } catch (error) {
 console.error("Failed to close:", error);
 }
 };`;

const closeFnRepl = `const handleCloseSession = async () => {
 try {
 const { error } = await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id);
 
 if (error) throw error;
 
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
 return true;
 } catch (error) {
 console.error("Failed to close:", error);
 throw error;
 }
 };`;

code = code.replace(closeFnStr, closeFnRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Patched handleCloseSession');
