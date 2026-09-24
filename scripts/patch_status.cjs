const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

const stateStr = `const [existingLedgerIds, setExistingLedgerIds] = useState({});`;
const stateStrRepl = `const [existingLedgerIds, setExistingLedgerIds] = useState({});
const [submissionStatus, setSubmissionStatus] = useState({});`;
code = code.replace(stateStr, stateStrRepl);

const subsLoopStr = `    const { data: subs } = await supabase.from('assignment_submissions').select('student_id, marks_awarded').eq('assignment_id', selectedAssessmentType);
    subs?.forEach(s => {
        if (s.marks_awarded !== null && s.marks_awarded !== undefined && newMarksData[s.student_id] === undefined) {
            newMarksData[s.student_id] = s.marks_awarded;
        }
    });`;
const subsLoopStrRepl = `    const { data: subs } = await supabase.from('assignment_submissions').select('student_id, marks_awarded, status').eq('assignment_id', selectedAssessmentType);
    const statMap = {};
    subs?.forEach(s => {
        statMap[s.student_id] = s.status;
        if (s.marks_awarded !== null && s.marks_awarded !== undefined && newMarksData[s.student_id] === undefined) {
            newMarksData[s.student_id] = s.marks_awarded;
        }
    });
    setSubmissionStatus(statMap);`;
code = code.replace(subsLoopStr, subsLoopStrRepl);

const nameColStr = `<td className="px-6 py-3">
 <span className="text-sm font-bold text-themeText">{student.full_name}</span>
 </td>`;
const nameColStrRepl = `<td className="px-6 py-3">
 <span className="text-sm font-bold text-themeText">{student.full_name}</span>
 {!isGenericAssessment && submissionStatus[student.id] && (
    <span className="ml-2 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-themeAccent/10 text-themeAccent border border-themeAccent/20">{submissionStatus[student.id]}</span>
 )}
 </td>`;
code = code.replace(nameColStr, nameColStrRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Patched UI for submission status');
