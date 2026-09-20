const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Fix the initial fetch logic for subjects
const oldFetchSubs = `const { data: subs, error: subErr } = await supabase
 .from('master_subjects')
 .select('id, name, code')
 .eq('faculty_id', userSession.db_id);`;

const newFetchSubs = `const { data: cohortSubs, error: subErr } = await supabase
 .from('cohort_subjects')
 .select('id, master_subjects(id, name, code)')
 .eq('faculty_id', userSession.db_id);
 
 const subs = (cohortSubs || []).map(cs => cs.master_subjects).filter(Boolean);
 // Remove duplicates
 const uniqueSubs = [];
 const seen = new Set();
 subs.forEach(s => {
     if (!seen.has(s.id)) {
         seen.add(s.id);
         uniqueSubs.push(s);
     }
 });`;

c = c.replace(oldFetchSubs, newFetchSubs);

// Also change if (subs) to if (uniqueSubs) for setSubjects
c = c.replace(
    /if \(subs\) \{\s*setSubjects\(subs\);\s*sessionStorage\.setItem\(`fac_assign_subjects_\$\{userSession\.db_id\}`,\s*JSON\.stringify\(subs\)\);\s*\}/,
    `if (uniqueSubs.length > 0) {
        setSubjects(uniqueSubs);
        sessionStorage.setItem(\`fac_assign_subjects_\${userSession.db_id}\`, JSON.stringify(uniqueSubs));
    }`
);

c = c.replace(
    /\.in\('subject_id', \(subs \|\| \[\]\)\.map\(s => s\.id\)\);/,
    `.in('subject_id', (uniqueSubs || []).map(s => s.id));`
);

// 2. Fix the insert logic to correctly pull master_subjects.id and batch
const oldInsertIds = `const finalSubjectId = subjectContext ? subjectContext.id : formData.subject_id;
 
 const { error } = await supabase.from('assignments').insert({
 faculty_id: userSession.db_id,
 subject_id: finalSubjectId,
 batch: subjectContext ? subjectContext.batch_id : formData.batch,`;

const newInsertIds = `const finalSubjectId = subjectContext ? (subjectContext.master_subjects?.id || subjectContext.subject_id || subjectContext.id) : formData.subject_id;
 const finalBatch = subjectContext ? (subjectContext.batches?.[0] || subjectContext.batch || "") : formData.batch;
 
 const { error } = await supabase.from('assignments').insert({
 faculty_id: userSession.db_id,
 subject_id: finalSubjectId,
 batch: finalBatch,`;

c = c.replace(oldInsertIds, newInsertIds);

// Wait, the original code had:
// batch: subjectContext ? subjectContext.batch_id : formData.batch,
// Let's make sure it handles both forms of subjectContext just in case.

fs.writeFileSync(p, c);
console.log("Patched FacultyAssignments logic.");
