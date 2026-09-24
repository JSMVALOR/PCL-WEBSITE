const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

const fetchStr = `// 2. Fetch Existing Marks
 let query = supabase.from('marks_ledger')
 .select('id, student_id, marks_obtained')
 .eq('faculty_id', userSession.db_id)
 .eq('subject_id', selectedSubject);

 if (!isGenericAssessment) {
 query = query.eq('assignment_id', selectedAssessmentType);
 } else {
 query = query.eq('assessment_type', selectedAssessmentType);
 }

 const { data: marks, error: mErr } = await query;
 if (mErr) throw mErr;

 // Map existing data to state
 const newMarksData = {};
 const newLedgerIds = {};
 marks?.forEach(m => {
 newMarksData[m.student_id] = m.marks_obtained;
 newLedgerIds[m.student_id] = m.id;
 });`;
 
const fetchStrRepl = `// 2. Fetch Existing Marks
 let query = supabase.from('marks_ledger')
 .select('id, student_id, marks_obtained')
 .eq('faculty_id', userSession.db_id)
 .eq('subject_id', selectedSubject);

 if (!isGenericAssessment) {
 query = query.eq('assignment_id', selectedAssessmentType);
 } else {
 query = query.eq('assessment_type', selectedAssessmentType);
 }

 const { data: marks, error: mErr } = await query;
 if (mErr) throw mErr;

 // Map existing data to state
 const newMarksData = {};
 const newLedgerIds = {};
 marks?.forEach(m => {
 newMarksData[m.student_id] = m.marks_obtained;
 newLedgerIds[m.student_id] = m.id;
 });
 
 // If assignment, also pull from assignment_submissions
 if (!isGenericAssessment) {
    const { data: subs } = await supabase.from('assignment_submissions').select('student_id, marks_awarded').eq('assignment_id', selectedAssessmentType);
    subs?.forEach(s => {
        if (s.marks_awarded !== null && s.marks_awarded !== undefined && newMarksData[s.student_id] === undefined) {
            newMarksData[s.student_id] = s.marks_awarded;
        }
    });
 }`;

code = code.replace(fetchStr, fetchStrRepl);
fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Patched fetchStudentsAndMarks');
