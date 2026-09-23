const fs = require('fs');

const code = fs.readFileSync('src/ERP/components/Student/Attendance/Attendance.jsx', 'utf-8');

const oldFetch = ` const fetchAcademicData = useCallback(async () => {
 const studentId = userSession?.db_id || userSession?.id;
 if (!studentId) return;
 setIsLoading(true);
 try {
 // 1. Fetch RAW verifiable attendance from new schema
 const { data: attData, error } = await supabase
 .from('attendance_records')
 .select('id, entry_status, exit_status, entry_marked_at, session:class_sessions(id, date, status, schedule_id)')
 .eq('student_id', studentId)
 .order('entry_marked_at', { ascending: false });

 if (error) throw error;

 if (attData && attData.length > 0) {
 // Fetch Schedule & Subjects manually since foreign key is missing
 const scheduleIds = [...new Set(attData.map(a => a.session?.schedule_id).filter(Boolean))];
 let schedMap = {};
 if (scheduleIds.length > 0) {
    const { data: schedData } = await supabase.from('class_schedule').select('id, start_time, end_time, room_id, batch, faculty_id, subject:master_subjects(id, name, code), room:academic_classrooms(name)').in('id', scheduleIds);
    if (schedData) {
        schedData.forEach(s => { schedMap[s.id] = s; });
    }
 }

 // 2. Client-Side Aggregation
 const subjectMap = {};
 let attCount = 0, missCount = 0, medCount = 0, appCount = 0, totCount = 0, lateCount = 0;

 attData.forEach(record => {
 const session = record.session;
 if (!session) return;
 session.schedule = schedMap[session.schedule_id];
 if (!session.schedule?.subject) return;

 const subjObj = session.schedule?.subject;
 const subjId = subjObj.id;
 
 if(!subjectMap[subjId]) {
 subjectMap[subjId] = {
 id: subjId,
 course_code: subjObj?.code || 'N/A',
 course_name: subjObj?.name || 'Unknown Course',
 faculty_id: session.schedule?.faculty_id,
 total_classes: 0,
 present: 0,
 absent: 0,
 medical: 0,
 approved: 0,
 unmarked: 0,
 records: []
 };
 }
 
 subjectMap[subjId].total_classes += 1;
 totCount += 1;

 if (record.entry_status === 'present') { subjectMap[subjId].present += 1; attCount += 1; }
   else if (record.entry_status === 'late') { subjectMap[subjId].late += 1; lateCount += 1; attCount += 1; /* Count late as present for health */ }
 else if (record.entry_status === 'absent') { subjectMap[subjId].absent += 1; missCount += 1; }
 else if (record.entry_status === 'medical') { subjectMap[subjId].medical += 1; medCount += 1; }
 else if (record.entry_status === 'approved_leave') { subjectMap[subjId].approved += 1; appCount += 1; }

 // Add to ledger
 subjectMap[subjId].records.push({ id: record.id,
 date: session.date,
 session_id: session.id,
 start_time: 'N/A',
 status: record.entry_status,
 room: 'N/A'
 });
 });

 const groupedData = Object.values(subjectMap);
 
 // Fetch Faculty Names (since they are only referenced by faculty_id in subjects now)
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
 } else {
 setAttendanceData([]);
 setOverallAttendance(100);
 }
 } catch (e) {
 console.error("Error fetching student attendance:", e);
 } finally {
 setIsLoading(false);
 }
 }, [userSession]);`;

const newFetch = ` const fetchAcademicData = useCallback(async () => {
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

 // 1b. Fetch all schedules for this batch to find unmarked
 const { data: allSchedules } = await supabase.from('class_schedule')
     .select('id, start_time, end_time, room_id, batch, faculty_id, subject:master_subjects(id, name, code), room:academic_classrooms(name)')
     .eq('batch', userSession.academic_batch || '');
     
 const schedMap = {};
 (allSchedules||[]).forEach(s => { schedMap[s.id] = s; });

 const scheduleIds = Object.keys(schedMap);
 let allSessions = [];
 if (scheduleIds.length > 0) {
     const { data: sData } = await supabase.from('class_sessions').select('id, date, status, schedule_id').in('schedule_id', scheduleIds);
     if (sData) allSessions = sData;
 }

 // 2. Client-Side Aggregation
 const subjectMap = {};
 let attCount = 0, missCount = 0, medCount = 0, appCount = 0, totCount = 0, lateCount = 0;

 // Initialize subject map with all enrolled subjects from schedule
 (allSchedules||[]).forEach(sch => {
     if (!sch.subject) return;
     const subjId = sch.subject.id;
     if (!subjectMap[subjId]) {
         subjectMap[subjId] = {
             id: subjId,
             course_code: sch.subject?.code || 'N/A',
             course_name: sch.subject?.name || 'Unknown Course',
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

 // Process actual sessions and attendance
 allSessions.forEach(session => {
     if (new Date(session.date) > new Date()) return; // ignore future
     
     const sch = schedMap[session.schedule_id];
     if (!sch || !sch.subject) return;
     const subjId = sch.subject.id;
     
     // Find if student was marked
     const studentRecord = (attData||[]).find(a => a.session?.id === session.id);
     
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
             date: session.date,
             session_id: session.id,
             start_time: sch.start_time,
             status: studentRecord.entry_status,
             room: sch.room?.name || 'N/A'
         });
     } else {
         subjectMap[subjId].unmarked += 1;
         subjectMap[subjId].records.push({ 
             id: 'unmarked-' + session.id,
             date: session.date,
             session_id: session.id,
             start_time: sch.start_time,
             status: 'unmarked',
             room: sch.room?.name || 'N/A'
         });
     }
 });
 
 // Sort records by date desc
 Object.values(subjectMap).forEach(subj => {
     subj.records.sort((a, b) => new Date(b.date) - new Date(a.date));
 });

 const groupedData = Object.values(subjectMap);
 
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

const newCode = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/ERP/components/Student/Attendance/Attendance.jsx', newCode);
console.log("Patched Student Attendance.");
