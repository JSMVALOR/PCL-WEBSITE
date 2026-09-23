const fs = require('fs');

let path = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(path, 'utf8');

// Find the start and end of fetchAcademicData
const startIdx = content.indexOf('const fetchAcademicData = useCallback(async () => {');
const endIdx = content.indexOf('}, [userSession]);', startIdx) + '}, [userSession]);'.length;

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find fetchAcademicData in Student Attendance");
    process.exit(1);
}

const newFetch = `const fetchAcademicData = useCallback(async () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;
        setIsLoading(true);
        try {
            // 1. Fetch RAW verifiable attendance
            const { data: attData, error } = await supabase
                .from('attendance_records')
                .select('id, entry_status, exit_status, entry_marked_at, session:class_sessions(id, date, status, schedule_id)')
                .eq('student_id', studentId)
                .order('entry_marked_at', { ascending: false });

            if (error) throw error;

            // 1b. Fetch all schedules for this batch to find unmarked/unconducted
            const { data: allSchedules } = await supabase.from('class_schedule')
                .select('id, start_time, end_time, room_id, batch, day_of_week, faculty_id, subject:master_subjects(id, name, code, theme_color), room:academic_classrooms(name)')
                .eq('batch', userSession.academic_batch || '');
                
            const schedMap = {};
            (allSchedules||[]).forEach(s => { schedMap[s.id] = s; });

            const scheduleIds = Object.keys(schedMap);
            let allSessions = [];
            if (scheduleIds.length > 0) {
                const { data: sData } = await supabase.from('class_sessions').select('id, date, status, schedule_id').in('schedule_id', scheduleIds);
                if (sData) allSessions = sData;
            }

            // Calculate past dates up to 14 days to find completely un-started classes
            const today = new Date();
            today.setHours(0,0,0,0);
            const pastDates = [];
            for(let i=0; i<=14; i++) { // Include today for un-started
                let d = new Date(today);
                d.setDate(d.getDate() - i);
                pastDates.push(d);
            }
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // 2. Client-Side Aggregation
            const subjectMap = {};
            let attCount = 0, missCount = 0, medCount = 0, appCount = 0, totCount = 0, lateCount = 0;

            // Initialize subject map
            (allSchedules||[]).forEach(sch => {
                if (!sch.subject) return;
                const subjId = sch.subject.id;
                if (!subjectMap[subjId]) {
                    subjectMap[subjId] = {
                        id: subjId,
                        course_code: sch.subject?.code || 'N/A',
                        course_name: sch.subject?.name || 'Unknown Course',
                        theme_color: sch.subject?.theme_color || 'default',
                        faculty_id: sch.faculty_id,
                        total_classes: 0,
                        present: 0,
                        absent: 0,
                        medical: 0,
                        approved: 0,
                        unmarked: 0,
                        records: []
                    };
                }
            });

            // Iterate over past dates to simulate what classes *should* have happened
            pastDates.forEach(dateObj => {
                const dateStr = dateObj.toISOString().split('T')[0];
                const dayName = dayNames[dateObj.getDay()];
                const dayNumStr = String(dateObj.getDay());

                (allSchedules||[]).forEach(sch => {
                    if (String(sch.day_of_week) !== dayName && String(sch.day_of_week) !== dayNumStr) return;
                    if (!sch.subject) return;
                    const subjId = sch.subject.id;

                    // Did the faculty create a session for this?
                    const sessionExists = allSessions.find(ses => ses.schedule_id === sch.id && ses.date === dateStr);
                    
                    if (sessionExists) {
                        // Check if student was marked
                        const studentRecord = (attData||[]).find(a => a.session?.id === sessionExists.id);
                        
                        subjectMap[subjId].total_classes += 1;
                        totCount += 1;
                        
                        if (studentRecord) {
                            if (studentRecord.entry_status === 'present') { subjectMap[subjId].present += 1; attCount += 1; }
                            else if (studentRecord.entry_status === 'late') { subjectMap[subjId].late += 1; lateCount += 1; attCount += 1; }
                            else if (studentRecord.entry_status === 'absent') { subjectMap[subjId].absent += 1; missCount += 1; }
                            else if (studentRecord.entry_status === 'medical') { subjectMap[subjId].medical += 1; medCount += 1; }
                            else if (studentRecord.entry_status === 'approved_leave') { subjectMap[subjId].approved += 1; appCount += 1; }
                            
                            subjectMap[subjId].records.push({ 
                                id: studentRecord.id,
                                date: sessionExists.date,
                                session_id: sessionExists.id,
                                start_time: sch.start_time,
                                status: studentRecord.entry_status,
                                room: sch.room?.name || 'N/A'
                            });
                        } else {
                            // Faculty started class, but student was completely unmarked (missing record)
                            subjectMap[subjId].unmarked += 1;
                            subjectMap[subjId].records.push({ 
                                id: 'unmarked-' + sessionExists.id,
                                date: sessionExists.date,
                                session_id: sessionExists.id,
                                start_time: sch.start_time,
                                status: 'unmarked', // We render this as a grey minus
                                room: sch.room?.name || 'N/A'
                            });
                        }
                    } else {
                        // Faculty NEVER started the class. It is 'Not Conducted' / Unmarked completely.
                        // We do not increment total_classes for the student so it doesn't hurt their %.
                        subjectMap[subjId].records.push({
                            id: 'not-conducted-' + sch.id + '-' + dateStr,
                            date: dateStr,
                            session_id: null,
                            start_time: sch.start_time,
                            status: 'unmarked',
                            room: sch.room?.name || 'N/A'
                        });
                    }
                });
            });
            
            // Sort records by date desc
            Object.values(subjectMap).forEach(subj => {
                subj.records.sort((a, b) => new Date(b.date) - new Date(a.date));
            });

            const groupedData = Object.values(subjectMap).filter(d => d.total_classes > 0 || d.records.length > 0);
            
            // Fetch Faculty Names
            const facIds = [...new Set(groupedData.map(d => d.faculty_id).filter(Boolean))];
            if(facIds.length > 0) {
                const { data: profs } = await supabase.from('profiles').select('id, full_name').in('id', facIds);
                groupedData.forEach(d => {
                    const prof = profs?.find(p => p.id === d.faculty_id);
                    d.faculty_name = prof ? prof.full_name : '—';
                });
            }

            setAttendanceData(groupedData);
            setTotalAttended(attCount);
            setTotalMissed(missCount);
            setTotalLate(lateCount);
            setTotalMedical(medCount);
            setTotalApproved(appCount);

            if (totCount > 0) {
                setOverallAttendance(Math.round(((attCount + lateCount) / totCount) * 100));
            } else {
                setOverallAttendance(100);
            }
        } catch (e) {
            console.error("Error fetching student attendance:", e);
        } finally {
            setIsLoading(false);
        }
    }, [userSession]);`;

content = content.substring(0, startIdx) + newFetch + content.substring(endIdx);
fs.writeFileSync(path, content);
console.log("Fully replaced fetchAcademicData in Student Attendance.jsx");
