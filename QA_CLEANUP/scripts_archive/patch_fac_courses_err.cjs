const fs = require('fs');

let fcPath = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let fc = fs.readFileSync(fcPath, 'utf8');

const badFetch = `const { data: sessions } = await supabase
 .from('class_sessions')
 .select('subject_id, status, total_students, present_count')
 .in('subject_id', subs && subs.length > 0 ? subs.map(s => s.id) : ['00000000-0000-0000-0000-000000000000'])
 .eq('status', 'completed');`;

const goodFetch = `// Removing broken class_sessions query that used non-existent columns
 const sessions = []; // Placeholder until attendance analytics view is created`;

fc = fc.split(badFetch).join(goodFetch);

fs.writeFileSync(fcPath, fc);
console.log("FacultyCourses class_sessions fetch patched!");
