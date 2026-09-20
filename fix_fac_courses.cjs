const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx';
let c = fs.readFileSync(p, 'utf8');

const oldSessionsFetch = `// 3. Fetch Sessions
 // Removing broken class_sessions query that used non-existent columns
 const sessions = []; // Placeholder until attendance analytics view is created`;

const newSessionsFetch = `// 3. Fetch Sessions
 const { data: sessions } = await supabase
 .from('class_sessions')
 .select('present_count, total_students, status, schedule:schedule_id(subject_id)')
 .eq('faculty_id', userSession.db_id)
 .neq('status', 'scheduled');`;

c = c.replace(oldSessionsFetch, newSessionsFetch);

const oldSubjSessionsFilter = `const subjSessions = (sessions || []).filter(s => s.subject_id === subject.id);`;
const newSubjSessionsFilter = `const subjSessions = (sessions || []).filter(s => s.schedule?.subject_id === subject.id);`;

c = c.replace(oldSubjSessionsFilter, newSubjSessionsFilter);

fs.writeFileSync(p, c);
console.log("Patched FacultyCourses sessions analytics.");
