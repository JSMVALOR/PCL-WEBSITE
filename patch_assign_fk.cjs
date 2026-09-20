const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /const finalSubjectId = subjectContext \? \(subjectContext\.master_subjects\?\.id \|\| subjectContext\.subject_id \|\| subjectContext\.id\) : formData\.subject_id;/,
    `let finalSubjectId = formData.subject_id;
    if (subjectContext) {
        if (subjectContext.master_subjects && typeof subjectContext.master_subjects === 'object' && subjectContext.master_subjects.id) {
            finalSubjectId = subjectContext.master_subjects.id;
        } else if (subjectContext.subject_id) {
            finalSubjectId = subjectContext.subject_id;
        } else if (subjectContext.master_subjects_id) {
            finalSubjectId = subjectContext.master_subjects_id;
        } else {
            finalSubjectId = subjectContext.id;
        }
    }`
);

fs.writeFileSync(p, c);
console.log("Patched assignment finalSubjectId extraction.");
