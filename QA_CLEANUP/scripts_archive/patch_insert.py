import re

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'r') as f:
    content = f.read()

# Fix the finalBatch / finalBatchId logic
old_logic = r""" const finalBatch = subjectContext \? \(subjectContext\.batches\?\.\[0\] \|\| subjectContext\.batch \|\| ""\) : formData\.batch;
 
 const \{ error \} = await supabase\.from\('assignments'\)\.insert\(\{
 faculty_id: userSession\.db_id,
 subject_id: finalSubjectId,
 batch: finalBatch,"""

new_logic = """ const finalBatch = subjectContext ? (subjectContext.batches?.[0] || subjectContext.batch || "") : formData.batch;
 const finalBatchId = subjectContext ? subjectContext.batch_id : null;
 
 const { error } = await supabase.from('assignments').insert({
 faculty_id: userSession.db_id,
 subject_id: finalSubjectId,
 batch: finalBatch,
 batch_id: finalBatchId,"""

content = re.sub(old_logic, new_logic, content)

with open('src/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'w') as f:
    f.write(content)
