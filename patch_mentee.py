import re

with open('src/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx', 'r') as f:
    content = f.read()

# 1. Update GRADE_MAP
old_grade_map = """const GRADE_MAP = {
    'O':  10.0,
    'A+': 9.0,
    'A':  8.0,
    'B+': 7.0,
    'B':  6.0,
    'C':  5.0,
    'P':  4.0,
    'F':  0.0,
    'AB': 0.0
};"""
new_grade_map = """const GRADE_MAP = {
    'O':  10.0,
    'A':  9.0,
    'B':  8.0,
    'C':  7.0,
    'D':  6.0,
    'E':  5.0,
    'F':  0.0,
    'AB': 0.0
};"""
content = content.replace(old_grade_map, new_grade_map)

# 2. Add student program fetching and subject fetching
# Let's find the fetchAll function
old_fetch_all = """    const fetchAll = async () => {
        setIsLoading(true);
        try {
            // Fetch university exam results
            const { data: examData, error: examErr } = await supabase
                .from('exam_results')
                .select('*')
                .eq('student_id', menteeId)
                .order('semester', { ascending: true })
                .order('subject_name', { ascending: true });

            if (examErr) throw examErr;
            setResults(examData || []);

            // Fetch internal marks
            const { data: marksData, error: marksErr } = await supabase
                .from('marks_ledger')
                .select('*, master_subjects:subject_id(name, code)')
                .eq('student_id', menteeId)
                .order('created_at', { ascending: false });

            if (!marksErr) setInternalMarks(marksData || []);
        } catch (err) {
            console.error("Failed to fetch academic record:", err);
        } finally {
            setIsLoading(false);
        }
    };"""

new_fetch_all = """    const [studentProfile, setStudentProfile] = useState(null);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            // Fetch student profile for program
            const { data: prof } = await supabase.from('profiles').select('programme, academic_batch').eq('id', menteeId).single();
            if (prof) setStudentProfile(prof);

            // Fetch university exam results
            const { data: examData, error: examErr } = await supabase
                .from('exam_results')
                .select('*')
                .eq('student_id', menteeId)
                .order('semester', { ascending: true })
                .order('subject_name', { ascending: true });

            if (examErr) throw examErr;
            setResults(examData || []);

            // Fetch internal marks
            const { data: marksData, error: marksErr } = await supabase
                .from('marks_ledger')
                .select('*, master_subjects:subject_id(name, code)')
                .eq('student_id', menteeId)
                .order('created_at', { ascending: false });

            if (!marksErr) setInternalMarks(marksData || []);
        } catch (err) {
            console.error("Failed to fetch academic record:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch subjects when semester changes in the form
    useEffect(() => {
        if (showEntryForm && entrySemester && studentProfile) {
            const fetchSubjects = async () => {
                // Find program ID
                const { data: progs } = await supabase.from('academic_programs').select('id, name');
                if (!progs) return;
                const match = progs.find(p => studentProfile.programme && studentProfile.programme.toLowerCase().includes(p.name.toLowerCase().replace('.', '')));
                if (!match) return;

                const { data: subs } = await supabase.from('master_subjects')
                    .select('name, code, credits')
                    .eq('program_id', match.id)
                    .eq('target_semester', parseInt(entrySemester))
                    .eq('status', 'active');
                
                if (subs && subs.length > 0) {
                    setEntryRows(subs.map(s => ({
                        subject_name: s.name,
                        subject_code: s.code || '',
                        marks_obtained: '',
                        max_marks: 100,
                        grade: '',
                        credits: s.credits || '',
                        result: 'pass'
                    })));
                } else {
                    setEntryRows([]);
                }
            };
            fetchSubjects();
        }
    }, [entrySemester, showEntryForm]);"""

content = content.replace(old_fetch_all, new_fetch_all)

# Remove the "+ ADD SUBJECT" button
# The button is: <button onClick={addRow} ...>+ ADD SUBJECT</button>
old_add_btn = """                                        <button onClick={addRow} className="px-4 py-2 rounded-lg border border-black/5 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-themeTextSec hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            + Add Subject
                                        </button>"""
new_add_btn = ""
if old_add_btn in content:
    content = content.replace(old_add_btn, new_add_btn)
else:
    # Let's use regex
    content = re.sub(r'<button onClick=\{addRow\}[^>]*>.*?Add Subject.*?</button>', '', content, flags=re.DOTALL)

with open('src/ERP/components/Faculty/FacultyMentorship/MenteeAcademicRecord.jsx', 'w') as f:
    f.write(content)

