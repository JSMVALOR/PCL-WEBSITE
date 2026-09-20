const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add sch_id and subject to missed array
content = content.replace(
    /missed\.push\(\{ date: dateStr, time: sch\.start_time, batch: sch\.batch \}\);/g,
    'missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, sch_id: sch.id, subject: cs.master_subjects });'
);
content = content.replace(
    /missed\.push\(\{ date: dateStr, time: sch\.start_time, batch: sch\.batch, status: sessionExists\.status \}\);/g,
    'missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id });'
);

// 2. Add handleResolveUnmarked function
const startAttIndex = content.indexOf('const handleStartAttendance = async (classData) => {');
const retroFunction = `    const handleResolveUnmarked = async (missedSlot) => {
        setIsSaving(true);
        try {
            let currentSession = null;
            if (missedSlot.session_id) {
                const { data } = await supabase.from('class_sessions').select('*').eq('id', missedSlot.session_id).single();
                currentSession = data;
            } else {
                const { data: newSession, error: insertError } = await supabase.from('class_sessions').insert({
                    schedule_id: missedSlot.sch_id,
                    faculty_id: userSession.db_id,
                    date: missedSlot.date,
                    status: 'ongoing',
                    started_at: new Date(missedSlot.date + 'T12:00:00').toISOString()
                }).select('*').single();
                if (insertError) throw insertError;
                currentSession = newSession;
            }

            // Fetch Enrolled Students based on batch (assume no elective here for simplicity, or handle it via master_subjects)
            let students = [];
            if (missedSlot.subject?.is_elective) {
                const { data: eleStudents } = await supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'student').contains('elective_subjects', [missedSlot.subject.id]).order('full_name');
                if (eleStudents) students = eleStudents;
            } else {
                const { data: batchStudents } = await supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'student').eq('academic_batch', missedSlot.batch).order('full_name');
                if (batchStudents) students = batchStudents;
            }
            setEnrolledStudents(students || []);

            // Fetch existing attendance records
            const { data: existingRecords } = await supabase.from('attendance_records').select('*').eq('session_id', currentSession.id);
            const recordMap = {};
            (existingRecords||[]).forEach(r => { recordMap[r.student_id] = r; });

            // Auto-create absent records for missing students locally first
            students.forEach(s => {
                if (!recordMap[s.id]) {
                    recordMap[s.id] = { student_id: s.id, session_id: currentSession.id, entry_status: 'absent', exit_status: null, isNew: true };
                }
            });

            setAttendanceRecords(recordMap);
            setActiveSession({ ...currentSession, classData: { id: missedSlot.sch_id, batch: missedSlot.batch, subject: missedSlot.subject } });
            setActiveTab("window");
            
        } catch (error) {
            console.error("Error resolving unmarked:", error);
            window.erpDialog?.alert("Failed to open retro-attendance session.");
        } finally {
            setIsSaving(false);
        }
    };

    `;
content = content.substring(0, startAttIndex) + retroFunction + content.substring(startAttIndex);

// 3. Update the UI button in the Unmarked section
const oldSpan = '<span className="text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded">Missing</span>';
const newBtn = `<button type="button" onClick={() => handleResolveUnmarked(m)} className="text-[11px] font-black uppercase tracking-wider text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition active:scale-95 flex items-center gap-2"><i className="fa-solid fa-pen-nib"></i> Mark Now</button>`;
content = content.replace(oldSpan, newBtn);

fs.writeFileSync(path, content);
console.log("Patched retro attendance.");
