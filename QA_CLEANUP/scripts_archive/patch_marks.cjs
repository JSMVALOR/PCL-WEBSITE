const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    `const { data: subs } = await supabase.from('master_subjects').select('id, name, code').eq('faculty_id', userSession.db_id);`,
    `const { data: rawSubs } = await supabase.from('cohort_subjects').select('id, batch_id, master_subjects(id, name, code)').eq('faculty_id', userSession.db_id);
                const subs = rawSubs ? rawSubs.map(s => ({ id: s.id, name: s.master_subjects?.name || 'Unknown', code: s.master_subjects?.code || 'Unknown' })) : [];`
);

fs.writeFileSync(p, c);
console.log("FacultyMarks query patched");
