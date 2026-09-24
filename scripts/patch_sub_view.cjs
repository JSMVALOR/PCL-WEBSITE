const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'utf8');

// 1. Add state for submission data
const stateStr = `const [submissionStatus, setSubmissionStatus] = useState({});`;
const stateStrRepl = `const [submissionStatus, setSubmissionStatus] = useState({});
const [submissionFiles, setSubmissionFiles] = useState({});`;
code = code.replace(stateStr, stateStrRepl);

// 2. Fetch file_url and submission_text
const fetchStr = `const { data: subs } = await supabase.from('assignment_submissions').select('student_id, marks_awarded, status').eq('assignment_id', selectedAssessmentType);
    const statMap = {};
    subs?.forEach(s => {
        statMap[s.student_id] = s.status;`;
const fetchStrRepl = `const { data: subs } = await supabase.from('assignment_submissions').select('student_id, marks_awarded, status, file_url, submission_text').eq('assignment_id', selectedAssessmentType);
    const statMap = {};
    const fileMap = {};
    subs?.forEach(s => {
        statMap[s.student_id] = s.status;
        fileMap[s.student_id] = { url: s.file_url, text: s.submission_text };`;
code = code.replace(fetchStr, fetchStrRepl);

// 3. set state
const setStatMapStr = `setSubmissionStatus(statMap);`;
const setStatMapRepl = `setSubmissionStatus(statMap);\n    setSubmissionFiles(fileMap);`;
code = code.replace(setStatMapStr, setStatMapRepl);

// 4. Render the view button in the name column (or a new column)
const nameColStr = ` {!isGenericAssessment && submissionStatus[student.id] && (
    <span className="ml-2 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-themeAccent/10 text-themeAccent border border-themeAccent/20">{submissionStatus[student.id]}</span>
 )}
 </td>`;
 
const nameColRepl = ` {!isGenericAssessment && submissionStatus[student.id] && (
    <span className="ml-2 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-themeAccent/10 text-themeAccent border border-themeAccent/20">{submissionStatus[student.id]}</span>
 )}
 {!isGenericAssessment && submissionFiles[student.id] && (submissionFiles[student.id].url || submissionFiles[student.id].text) && (
    <button onClick={() => {
        if (submissionFiles[student.id].url) window.open(submissionFiles[student.id].url, '_blank');
        else if (window.erpDialog) window.erpDialog.alert(submissionFiles[student.id].text, "Submission Text");
        else alert(submissionFiles[student.id].text);
    }} className="ml-2 text-[10px] uppercase font-bold tracking-widest text-blue-500 hover:text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 transition-colors">
        <i className="fa-solid fa-eye mr-1"></i> View
    </button>
 )}
 </td>`;
code = code.replace(nameColStr, nameColRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', code);
console.log('Patched FacultyMarks submission viewing');
