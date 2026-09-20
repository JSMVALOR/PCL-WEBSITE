const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /const \{ data: existingRecords \} = await supabase\.from\('attendance_records'\)\.select\('\*'\)\.eq\('session_id', currentSession\.id\);/g,
    `const { data: existingRecords, error: existingError } = await supabase.from('attendance_records').select('*').eq('session_id', currentSession.id);
            if (existingError) {
                window.erpDialog?.alert("Records Error: " + JSON.stringify(existingError));
                throw existingError;
            }`
);

fs.writeFileSync(path, content);
console.log("Patched third error.");
