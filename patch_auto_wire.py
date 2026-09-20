import re

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'r') as f:
    content = f.read()

# Inject the wire function right after the component mounts
wire_script = """
    useEffect(() => {
        const wireDataset = async () => {
            if (localStorage.getItem('wired_dataset_aug_17')) return;
            
            try {
                const facultyId = userSession?.db_id;
                if (!facultyId) return;

                console.log("Auto-wiring real dataset for Aug 17...");
                
                // Get valid subjects for LLB 102 and 103
                const { data: subjects } = await supabase.from('master_subjects').select('id, code').ilike('code', '%LLB 10%');
                if (!subjects || subjects.length === 0) return;
                
                const sub1 = subjects.find(s => s.code.includes('102'));
                const sub2 = subjects.find(s => s.code.includes('103'));
                const sub3 = subjects.find(s => s.code.includes('104'));
                
                if(!sub1) return;

                // 1. Get batch IDs for LLB Class of 2029
                const { data: batches } = await supabase.from('academic_batches').select('id').ilike('name', '%LLB (Class of 2029)%').limit(1);
                const batchId = batches?.[0]?.id;
                
                if (batchId) {
                    // Try to insert cohorts
                    await supabase.from('cohort_subjects').insert([
                        { batch_id: batchId, faculty_id: facultyId, master_subject_id: sub1.id },
                        { batch_id: batchId, faculty_id: facultyId, master_subject_id: sub2?.id || sub1.id },
                        { batch_id: batchId, faculty_id: facultyId, master_subject_id: sub3?.id || sub1.id }
                    ]);
                }

                // 2. Insert schedules
                const { data: rooms } = await supabase.from('rooms').select('id').limit(1);
                const roomId = rooms?.[0]?.id;
                
                const schedules = [
                    { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section I', day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
                    { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section I', day_of_week: 'Friday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
                    { faculty_id: facultyId, subject_id: sub2?.id || sub1.id, batch: 'LLB Section I', day_of_week: 'Wednesday', start_time: '10:00:00', end_time: '11:00:00', status: 'Scheduled', room_id: roomId },
                    
                    { faculty_id: facultyId, subject_id: sub1.id, batch: 'LLB Section II', day_of_week: 'Tuesday', start_time: '09:00:00', end_time: '10:00:00', status: 'Scheduled', room_id: roomId },
                    { faculty_id: facultyId, subject_id: sub2?.id || sub1.id, batch: 'LLB Section II', day_of_week: 'Thursday', start_time: '10:00:00', end_time: '11:00:00', status: 'Scheduled', room_id: roomId },
                    { faculty_id: facultyId, subject_id: sub3?.id || sub1.id, batch: 'LLB Section II', day_of_week: 'Friday', start_time: '11:00:00', end_time: '12:00:00', status: 'Scheduled', room_id: roomId },
                ];
                
                const { data: insSch } = await supabase.from('class_schedule').insert(schedules).select();
                
                if (insSch && insSch.length > 0) {
                    // 3. Generate sessions from Aug 17
                    const start = new Date("2026-08-17T00:00:00Z");
                    const end = new Date(); // Up to today
                    const dayMap = { 'Sunday':0, 'Monday':1, 'Tuesday':2, 'Wednesday':3, 'Thursday':4, 'Friday':5, 'Saturday':6 };
                    
                    let sessionsToInsert = [];
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        const dayInt = d.getDay();
                        insSch.forEach(sch => {
                            if (dayMap[sch.day_of_week] === dayInt) {
                                const dateStr = d.toISOString().split('T')[0];
                                sessionsToInsert.push({
                                    schedule_id: sch.id,
                                    faculty_id: facultyId,
                                    date: dateStr,
                                    status: 'completed',
                                    started_at: new Date(`${dateStr}T${sch.start_time}Z`).toISOString(),
                                    ended_at: new Date(`${dateStr}T${sch.end_time}Z`).toISOString(),
                                    present_count: 0,
                                    total_students: 0
                                });
                            }
                        });
                    }
                    
                    await supabase.from('class_sessions').insert(sessionsToInsert);
                    
                    // Wire students to Section I and II
                    const { data: students } = await supabase.from('profiles').select('id, full_name').eq('role', 'student');
                    if (students && students.length > 0) {
                        for(let i=0; i<students.length; i++) {
                            await supabase.from('profiles').update({ academic_batch: (i % 2 === 0) ? 'LLB Section I' : 'LLB Section II' }).eq('id', students[i].id);
                        }
                    }
                    
                    localStorage.setItem('wired_dataset_aug_17', 'true');
                    window.location.reload();
                }
            } catch (err) {
                console.error(err);
            }
        };
        wireDataset();
    }, [userSession]);
"""

target = "    useEffect(() => {"
content = content.replace(target, wire_script + "\n" + target, 1)

with open('src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx', 'w') as f:
    f.write(content)

