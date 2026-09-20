const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /const \{ data: newSession, error: insertError \} = await supabase\.from\('class_sessions'\)\.insert\(\{([\s\S]*?)\}\)\.select\('\*'\)\.single\(\);/g,
    `const { data: newSession, error: insertError } = await supabase.from('class_sessions').insert({$1}).select('*').single();
                if (insertError) {
                    window.erpDialog?.alert("Insert Error: " + JSON.stringify(insertError));
                    throw insertError;
                }`
);

content = content.replace(
    /const \{ data: batchStudents \} = await supabase\.from\('profiles'\)\.select\('id, full_name, erp_id'\)\.eq\('role', 'student'\)\.eq\('academic_batch', missedSlot\.batch\)\.order\('full_name'\);/g,
    `const { data: batchStudents, error: batchError } = await supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'student').eq('academic_batch', missedSlot.batch).order('full_name');
                if (batchError) {
                    window.erpDialog?.alert("Batch Error: " + JSON.stringify(batchError));
                    throw batchError;
                }`
);

fs.writeFileSync(path, content);
console.log("Patched exact error.");
