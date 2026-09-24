const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'utf8');

const closeFnStr = `const { error } = await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id);
 
 if (error) throw error;`;
 
const closeFnRepl = `const { error } = await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id)
 .select('id')
 .single();
 
 if (error) throw error;`;

code = code.replace(closeFnStr, closeFnRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', code);
console.log('Patched throw');
