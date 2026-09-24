const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', 'utf8');

// Replace the RAW verifiable attendance query to include batch_id
code = code.replace(
    /session:class_sessions\(id, date, status, schedule_id\)/g,
    'session:class_sessions(id, date, status, schedule_id, batch_id)'
);

// We need to fetch all cohort_subjects for this batch to resolve Adhoc sessions
code = code.replace(
    "// 1b. Fetch all schedules for this batch to find unmarked/unconducted",
    `
            // Fetch all cohort_subjects to resolve subject_ids for Adhoc sessions
            const { data: allCohortSubjects } = await supabase.from('cohort_subjects')
                .select('id, master_subjects(id, name, code, theme_color)');
            const cohortMap = {};
            (allCohortSubjects||[]).forEach(cs => { if (cs.master_subjects) cohortMap[cs.id] = cs.master_subjects; });

            // 1b. Fetch all schedules for this batch to find unmarked/unconducted`
);

// We need to iterate over attData and add them if they were missed by the schedules loop
const attDataLoop = `
            // Add any actual attendance records that were missed (e.g., Adhoc classes)
            (attData||[]).forEach(record => {
                if (!record.session) return;
                let masterSubject = null;
                let sch = null;
                
                if (record.session.schedule_id && schedMap[record.session.schedule_id]) {
                    sch = schedMap[record.session.schedule_id];
                    masterSubject = sch.subject;
                } else if (record.session.batch_id && cohortMap[record.session.batch_id]) {
                    masterSubject = cohortMap[record.session.batch_id];
                }
                
                if (!masterSubject) return;
                
                const subjId = masterSubject.id;
                
                // Initialize if missing
                if (!subjectMap[subjId]) {
                    subjectMap[subjId] = {
                        id: subjId,
                        course_code: masterSubject.code || 'N/A',
                        course_name: masterSubject.name || 'Unknown Course',
                        theme_color: masterSubject.theme_color || 'default',
                        faculty_id: sch ? sch.faculty_id : null,
                        total_classes: 0,
                        present: 0,
                        absent: 0,
                        medical: 0,
                        approved: 0,
                        unmarked: 0,
                        records: []
                    };
                }
                
                // Check if this session is already in records
                const alreadyExists = subjectMap[subjId].records.find(r => r.session_id === record.session.id);
                if (!alreadyExists) {
                    subjectMap[subjId].total_classes += 1;
                    totCount += 1;
                    
                    let mappedStatus = record.entry_status;
                    const exempt = isDateExempt(record.session.date);

                    if (exempt && (mappedStatus === 'absent' || mappedStatus === 'unmarked')) {
                        mappedStatus = 'exempted';
                        subjectMap[subjId].total_classes -= 1;
                        totCount -= 1;
                    }

                    if (mappedStatus === 'present') { subjectMap[subjId].present += 1; attCount += 1; }
                    else if (mappedStatus === 'late') { subjectMap[subjId].late = (subjectMap[subjId].late || 0) + 1; lateCount += 1; attCount += 1; }
                    else if (mappedStatus === 'absent') { subjectMap[subjId].absent += 1; missCount += 1; }
                    else if (mappedStatus === 'medical') { subjectMap[subjId].medical += 1; medCount += 1; }
                    else if (mappedStatus === 'approved_leave') { subjectMap[subjId].approved += 1; appCount += 1; }
                    else if (mappedStatus === 'unmarked') { subjectMap[subjId].unmarked += 1; }
                    
                    subjectMap[subjId].records.push({ 
                        id: record.id,
                        date: record.session.date,
                        session_id: record.session.id,
                        start_time: sch ? sch.start_time : 'Adhoc',
                        status: mappedStatus,
                        room: sch?.room?.name || 'N/A'
                    });
                }
            });
`;

code = code.replace(
    "// Sort records by date desc",
    attDataLoop + "\n            // Sort records by date desc"
);

fs.writeFileSync('Frontend/ERP/components/Student/Attendance/Attendance.jsx', code);
