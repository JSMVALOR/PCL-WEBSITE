/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import SwipeableRosterDeck from './SwipeableRosterDeck';
import SwipeRow from '../../../../Shared/components/ReactBits/SwipeRow/SwipeRow';
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon, Cancel01Icon, Add01Icon } from '@hugeicons/core-free-icons';
import { GlassSurface } from "../../ui/GlassSurface";
import { Badge } from "../../ui/Badge";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import { sendSystemEmail, sendSystemWhatsApp } from '../../../../ERP/lib/EmailService';



const getLocalDateString = (d) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function FacultyAttendance({ subjectContext }) {
 const { userSession } = useERP();
 
 // UI State
 const [activeTab, setActiveTab] = useState(() => {
        const cached = sessionStorage.getItem(`fac_todayClasses_${userSession?.db_id}`);
        return (cached && JSON.parse(cached).length > 0) ? "today" : "analytics";
    }); // today, window, analytics
 // Data State
 const [allSubjects, setAllSubjects] = useState([]);
    const [unmarkedSubjects, setUnmarkedSubjects] = useState([]);
    const [selectedUnmarkedSubject, setSelectedUnmarkedSubject] = useState(null);
 const [todayClasses, setTodayClasses] = useState(() => {
 const cached = sessionStorage.getItem(`fac_todayClasses_${userSession?.db_id}`);
 return cached ? JSON.parse(cached) : [];
 });
 const [activeSession, setActiveSession] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null); // The current class_sessions row
 const [enrolledStudents, setEnrolledStudents] = useState([]);
 const [attendanceRecords, setAttendanceRecords] = useState({}); // Maps student_id to status
 const [searchQuery, setSearchQuery] = useState("");
 const [isSwipeMode, setIsSwipeMode] = useState(window.innerWidth < 1024);
 const [attendancePhase, setAttendancePhase] = useState("entry"); // entry, exit
  const [isSaving, setIsSaving] = useState(false);
 
 // QR State
 const [qrActive, setQrActive] = useState(false);
 const [qrToken, setQrToken] = useState(null);
 const [qrTimeLeft, setQrTimeLeft] = useState(0);

 const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

 useEffect(() => {
 if (userSession?.db_id) {
 fetchTodayClasses();
 fetchAllSubjects();
 }
 }, [userSession]);
 
 const fetchAllSubjects = async () => {
    if (!userSession?.db_id) return;
    try {
        const { data: directSubs, error: subErr } = await supabase
            .from('cohort_subjects')
            .select('id, batch_id, master_subjects(id, name, code)')
            .eq('faculty_id', userSession.db_id);
        if (subErr) throw subErr;

        const { data: scheduledSubs } = await supabase.from('class_schedule').select('subject_id').eq('faculty_id', userSession.db_id);

        let allSubIds = (directSubs || []).map(s => s.id);
        if (scheduledSubs && scheduledSubs.length > 0) {
            allSubIds = [...new Set([...allSubIds, ...scheduledSubs.map(s => s.subject_id)])];
        }

        let finalSubs = directSubs || [];
        const missingIds = allSubIds.filter(id => !finalSubs.find(s => s.id === id));

        if (missingIds.length > 0) {
            const { data: extraSubs } = await supabase.from('cohort_subjects').select('id, batch_id, master_subjects(id, name, code)').in('id', missingIds);
            if (extraSubs) {
                finalSubs = [...finalSubs, ...extraSubs];
            }
        }
        
        const cohortSubs = finalSubs;

        if (cohortSubs && cohortSubs.length > 0) {
            const { data: rawSessions, error: sesError } = await supabase
                .from('class_sessions')
                .select('present_count, total_students, schedule_id, date, status')
                .eq('faculty_id', userSession.db_id)
                .neq('status', 'scheduled');
                
            let sessions = rawSessions || [];
            if (sessions.length > 0) {
                const { data: schData } = await supabase.from('class_schedule').select('id, subject_id').in('id', sessions.map(s => s.schedule_id).filter(Boolean));
                if (schData) {
                    sessions = sessions.map(s => ({ ...s, class_schedule: schData.find(x => x.id === s.schedule_id) }));
                }
            }
            
            if (sesError) throw sesError;

            // Fetch schedules and basic sessions for unmarked calculation
            const masterIds = cohortSubs.map(c => c.master_subjects?.id).filter(Boolean);
            // Fix: class_schedule.batch is a string name, cohort_subjects.batch_id is a UUID. 
            // We just fetch class_schedule for this faculty directly.
            const { data: fullSchedule } = await supabase.from('class_schedule').select('id, subject_id, day_of_week, start_time, batch').eq('faculty_id', userSession.db_id);
            const { data: allSessions } = await supabase.from('class_sessions').select('id, schedule_id, date, status').in('schedule_id', (fullSchedule||[]).map(s=>s.id));

            // Calculate unmarked dates
            const today = new Date();
            today.setHours(0,0,0,0);
            const pastDates = [];
            for(let i=1; i<=30; i++) {
                let d = new Date(today);
                d.setDate(d.getDate() - i);
                pastDates.push(d);
            }
            
            const unmarkedMap = {};
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            cohortSubs.forEach(cs => {
                // Ignore batch string comparison, just match by subject_id.
                // In a real multi-batch scenario, we'd join academic_batches to match the name.
                const subSched = (fullSchedule||[]).filter(s => s.subject_id === cs.master_subjects?.id);
                if (subSched.length === 0) return;

                const missed = [];
                pastDates.forEach(dateObj => {
                    const dayName = dayNames[dateObj.getDay()];
                    // check if schedule has this day
                    const classesOnThisDay = subSched.filter(s => String(s.day_of_week) === dayName || String(s.day_of_week) === String(dateObj.getDay()));
                    
                    classesOnThisDay.forEach(sch => {
                        // ignore if the semester wasn't active yet, but we'll assume last 30 days is fine for now
                        const dateStr = getLocalDateString(dateObj);
                        const sessionExists = (allSessions||[]).find(ses => ses.schedule_id === sch.id && ses.date === dateStr);
                        if (!sessionExists) {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, sch_id: sch.id, subject: cs.master_subjects, isMarked: false });
                        } else if (sessionExists.status !== 'completed') {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id, isMarked: false });
                        } else {
                            missed.push({ date: dateStr, time: sch.start_time, batch: sch.batch, status: sessionExists.status, sch_id: sch.id, subject: cs.master_subjects, session_id: sessionExists.id, isMarked: true });
                        }
                    });
                });

                if (missed.length > 0) {
                    unmarkedMap[cs.id] = {
                        id: cs.id,
                        name: cs.master_subjects?.name || 'Unknown',
                        code: cs.master_subjects?.code || 'Unknown',
                        batch: missed[0]?.batch || 'Section I',
                        missed: missed.sort((a,b) => new Date(b.date) - new Date(a.date))
                    };
                }
            });
            setUnmarkedSubjects(Object.values(unmarkedMap));

            const subjectsWithStats = cohortSubs.map(cs => {
                const subSessions = (sessions || []).filter(s => s.class_schedule?.subject_id === cs.master_subjects?.id);
                const classesDone = subSessions.length;
                let avgAttendance = 0;
                let totalP = 0;
                let totalS = 0;
                if (classesDone > 0) {
                    subSessions.forEach(s => {
                        totalP += (s.present_count || 0);
                        totalS += (s.total_students || 0);
                    });
                    if (totalS > 0) avgAttendance = Math.round((totalP / totalS) * 100);
                }
                return {
                    id: cs.id,
                    batch: cs.batch_id, // Kept for DB references if needed, but not rendered directly to users
                    name: cs.master_subjects?.name || 'Unknown',
                    code: cs.master_subjects?.code || 'Unknown',
                    classesDone,
                    avgAttendance,
                    totalAttended: totalP,
                    totalPossible: totalS
                };
            });
            setAllSubjects(subjectsWithStats);
            
            // Auto switch to analytics if no classes today
            const cachedToday = sessionStorage.getItem(`fac_todayClasses_${userSession?.db_id}`);
            const todayLen = cachedToday ? JSON.parse(cachedToday).length : 0;
            // if (todayLen === 0 && !activeSession) setActiveTab('analytics');
        }
    } catch(err) { console.error(err); }
 };

 // Timer for QR
 useEffect(() => {
 let interval;
 if (qrActive && qrTimeLeft > 0) {
 interval = setInterval(() => {
 setQrTimeLeft(prev => {
 if (prev <= 1) {
 setQrActive(false);
 return 0;
 }
 return prev - 1;
 });
 }, 1000);
 }
 return () => clearInterval(interval);
 }, [qrActive, qrTimeLeft]);

 const fetchTodayClasses = async () => {
 try {
 const currentDayInt = new Date().getDay();
        const daysMap = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' };
        const currentDayStr = daysMap[currentDayInt]; // 0 (Sun) to 6 (Sat)
 
 // 1. Get today's timetable for this faculty (via subject join)
 const { data: schedule, error: schError } = await supabase
 .from('class_schedule')
 .select(`
 id, subject_id, day_of_week, start_time, end_time, room:academic_classrooms(name), batch,
 subject:master_subjects(id, name, code)
 `)
 .eq('faculty_id', userSession.db_id)
 .in('day_of_week', [currentDayStr, currentDayInt.toString()])
 .order('start_time', { ascending: true });

 if (schError) throw schError;

 // 2. See if sessions are already created for today
 const todayDate = getLocalDateString(new Date());
 const { data: sessions, error: sesError } = await supabase
 .from('class_sessions')
 .select('*')
 .eq('faculty_id', userSession.db_id)
 .eq('date', todayDate);
 
 if (sesError) throw sesError;

 // Map schedule to sessions
 const enrichedClasses = schedule.map(sch => {
 const existingSession = sessions.find(s => s.schedule_id === sch.id);
 return {
 ...sch,
 session: existingSession || null
 };
 });

 setTodayClasses(enrichedClasses || []);
 sessionStorage.setItem(`fac_todayClasses_${userSession.db_id}`, JSON.stringify(enrichedClasses || []));
 } catch (error) {
 console.error("Error fetching today classes:", error);
 window.erpDialog?.alert("Failed to load today's schedule.");
 }
 };

     const handleResolveUnmarked = async (missedSlot) => {
        setIsSaving(true);
        try {
            let currentSession = null;
            if (missedSlot.session_id) {
                const { data } = await supabase.from('class_sessions').select('*').eq('id', missedSlot.session_id).single();
                currentSession = data;
            } else {
                if (!missedSlot.sch_id || !userSession.db_id || !missedSlot.date) {
                    window.erpDialog?.alert("Missing required fields for insert!");
                    throw new Error("Missing required fields for insert!");
                }
                const { data: newSession, error: insertError } = await supabase.from('class_sessions').insert({
                    schedule_id: missedSlot.sch_id,
                    faculty_id: userSession.db_id,
                    date: missedSlot.date,
                    subject_id: missedSlot.subject?.id,
                    status: 'ongoing',
                    started_at: new Date(missedSlot.date + 'T12:00:00').toISOString()
                }).select('*').single();
                if (insertError) {
                    window.erpDialog?.alert("Insert Error: " + JSON.stringify(insertError));
                    throw insertError;
                }
                if (insertError) throw insertError;
                currentSession = newSession;
            }

            // Fetch Enrolled Students based on batch (assume no elective here for simplicity, or handle it via master_subjects)
            let students = [];
            if (missedSlot.subject?.is_elective) {
                const { data: eleStudents } = await supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'student').contains('elective_subjects', [missedSlot.subject.id]).order('full_name');
                if (eleStudents) students = eleStudents;
            } else {
                const { data: batchStudents, error: batchError } = await supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'student').eq('academic_batch', missedSlot.batch).order('full_name');
                if (batchError) {
                    window.erpDialog?.alert("Batch Error: " + JSON.stringify(batchError));
                    throw batchError;
                }
                if (batchStudents) students = batchStudents;
            }
            setEnrolledStudents(students || []);

            // Fetch existing attendance records
            const { data: existingRecords, error: existingError } = await supabase.from('attendance_records').select('*').eq('session_id', currentSession.id);
            if (existingError) {
                window.erpDialog?.alert("Records Error: " + JSON.stringify(existingError));
                throw existingError;
            }
            const recordMap = {};
            (existingRecords||[]).forEach(r => { recordMap[r.student_id] = r; });

            // Auto-create absent records for missing students locally first
            // **AUTO-MARK MEDICAL LEAVE (M) LOGIC**
            let approvedLeaves = [];
            if (students.length > 0) {
                const sessionDateStr = currentSession.date || new Date().toISOString().split('T')[0];
                const { data: leaves } = await supabase
                    .from('leave_requests')
                    .select('student_id, start_date, end_date')
                    .eq('status', 'approved')
                    .in('student_id', students.map(s => s.id));
                if (leaves) {
                    approvedLeaves = leaves.filter(l => {
                        const sD = new Date(l.start_date); sD.setHours(0,0,0,0);
                        const eD = new Date(l.end_date); eD.setHours(23,59,59,999);
                        const cD = new Date(sessionDateStr);
                        return cD >= sD && cD <= eD;
                    }).map(l => l.student_id);
                }
            }

            students.forEach(s => {
                if (!recordMap[s.id]) {
                    const isMedical = approvedLeaves.includes(s.id);
                    recordMap[s.id] = { 
                        student_id: s.id, 
                        session_id: currentSession.id, 
                        entry_status: isMedical ? 'medical' : 'absent', 
                        exit_status: null, 
                        isNew: true 
                    };
                }
            });

            setAttendanceRecords(recordMap);
            setActiveSession({ ...currentSession, classData: { id: missedSlot.sch_id, batch: missedSlot.batch, subject: missedSlot.subject } });
            setActiveTab("window");
            if (missedSlot.isMarked) setIsSwipeMode(false);
            
        } catch (error) {
            console.error("Error resolving unmarked:", JSON.stringify(error, null, 2), error);
            window.erpDialog?.alert("Error: " + (error.message || JSON.stringify(error)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartAttendance = async (classData) => {
 setIsSaving(true);
 try {
 const todayDate = getLocalDateString(new Date());
 let currentSession = classData.session;

 // Create session if it doesn't exist
 if (!currentSession) {
 const { data: newSession, error: insertError } = await supabase
 .from('class_sessions')
 .insert({
 schedule_id: classData.id,
 faculty_id: userSession.db_id,
 date: todayDate,
                    subject_id: classData.subject?.id || classData.subject_id,
 status: 'ongoing',
 started_at: new Date().toISOString()
 })
 .select('*')
 .single();
 
 if (insertError) throw insertError;
 currentSession = newSession;
 }

 // Fetch Enrolled Students based on batch or elective
 let students = [];
 if (classData.subject?.is_elective) {
 // Fetch students who have this elective in their array
 const { data: electiveStudents, error: eleError } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id')
 .eq('role', 'student')
 .contains('elective_subjects', [classData.subject.id])
 .order('full_name');
 if (eleError) throw eleError;
 students = electiveStudents;
 } else {
 // Fetch students in the batch (text match)
 const { data: batchStudents, error: bError } = await supabase
 .from('profiles')
 .select('id, full_name, erp_id')
 .eq('role', 'student')
 .ilike('academic_batch', `%${classData.batch.split(' ')[0]}%`)
 .order('full_name');
 if (bError) throw bError;
 students = batchStudents;
 }

 setEnrolledStudents(students || []);

 // Fetch existing attendance records
 const { data: existingRecords, error: recError } = await supabase
 .from('attendance_records')
 .select('*')
 .eq('session_id', currentSession.id);
 
 if (recError) throw recError;
 
 // Map records
 const recordMap = {};
 existingRecords.forEach(r => {
 recordMap[r.student_id] = r;
 });

 // Auto-create absent records for missing students locally first
 students.forEach(s => {
 if (!recordMap[s.id]) {
 recordMap[s.id] = {
 student_id: s.id,
 session_id: currentSession.id,
 entry_status: 'absent', exit_status: null,
 isNew: true
 };
 }
 });

 setAttendanceRecords(recordMap);
 setActiveSession({ ...currentSession, classData });
 setActiveTab("window");
 
 } catch (error) {
 console.error("Error starting attendance:", error);
 window.erpDialog?.alert("Failed to initialize attendance session.");
 } finally {
 setIsSaving(false);
 }
 };

 const updateAttendance = async (studentId, status) => {
 try {
 const currentRecord = attendanceRecords[studentId];
 
 // Optimistic update
 setAttendanceRecords(prev => ({
 ...prev,
 [studentId]: { ...prev[studentId], ...(status === 'arrived_late' ? { entry_status: 'late', exit_status: 'present' } : (attendancePhase === 'exit' && Object.values(prev).every(r => r.isNew)) ? { entry_status: 'present', exit_status: status } : attendancePhase === 'entry' ? { entry_status: status } : { exit_status: status }), isNew: false }
 }));

 // Sync to DB
 let payload;
   const isPhaseOneSkipped = Object.values(attendanceRecords).every(r => r.isNew);
   if (status === 'arrived_late') {
       payload = {
           session_id: activeSession.id,
           student_id: studentId,
           entry_status: 'late',
           entry_marked_at: new Date().toISOString(),
           exit_status: 'present',
           exit_marked_at: new Date().toISOString(),
           marked_by: 'faculty'
       };
   } else if (attendancePhase === 'exit' && isPhaseOneSkipped) {
       payload = {
           session_id: activeSession.id,
           student_id: studentId,
           entry_status: 'present',
           entry_marked_at: new Date().toISOString(),
           exit_status: status,
           exit_marked_at: new Date().toISOString(),
           marked_by: 'faculty'
       };
   } else {
       payload = {
           session_id: activeSession.id,
           student_id: studentId,
           ...(attendancePhase === 'entry' ? { entry_status: status, entry_marked_at: new Date().toISOString() } : { exit_status: status, exit_marked_at: new Date().toISOString() }),
           marked_by: 'faculty'
       };
   }

 
            // HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', student.id).maybeSingle();
                if (mapping && mapping.parent_id) {
                    const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).single();
                    if (parent && parent.email) {
                        const studentObj = enrolledStudents.find(s => s.id === studentId);
                        sendSystemEmail('PARENT_ABSENT_ALERT', {
                            to_email: parent.email,
                            student_name: studentObj ? studentObj.full_name : 'Your Ward',
                            subject: activeSession.subject,
                            date: new Date().toLocaleDateString(),
                            portal_link: window.location.origin + '/login'
                        }).catch(e => console.error("Headless email failed", e));
                        
                        if (parent.phone) {
                            sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for ${activeSession.subject} on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`)
                            .catch(e => console.error("Headless WhatsApp failed", e));
                        }
                    }
                }
            }

        const { data: existing } = await supabase.from('attendance_records').select('id').eq('session_id', payload.session_id).eq('student_id', payload.student_id);
            let error;
            if (existing && existing.length > 0) {
                const { error: updErr } = await supabase.from('attendance_records').update(payload).eq('id', existing[0].id);
                error = updErr;
            } else {
                const { error: insErr } = await supabase.from('attendance_records').insert(payload);
                error = insErr;
            }
 
 if (error) {
 // Revert optimistic update if failed
 setAttendanceRecords(prev => ({
 ...prev,
 [studentId]: currentRecord
 }));
 throw error;
 }

 } catch (error) {
 console.error("Failed to mark attendance:", error);
 }
 };

 const handleBulkMark = async (status) => {
 if (!window.erpDialog?.confirm(`Mark ALL currently displayed students as ${status.toUpperCase()}?`)) return;
 setIsSaving(true);
 try {
 const updates = filteredStudents.map(student => ({
 session_id: activeSession.id,
   student_id: student.id,
   ...(attendancePhase === 'entry' ? { entry_status: status, entry_marked_at: new Date().toISOString() } : { exit_status: status, exit_marked_at: new Date().toISOString() }),
   marked_by: 'faculty'
 }));

 
            // HEADLESS NOTIFICATION TRIGGER
            if (status === 'absent') {
                // Find parent email mapped to this student
                const { data: mapping } = await supabase.from('parent_student_mappings').select('parent_id').eq('student_id', student.id).maybeSingle();
                if (mapping && mapping.parent_id) {
                    const { data: parent } = await supabase.from('profiles').select('email').eq('id', mapping.parent_id).single();
                    if (parent && parent.email) {
                        const studentObj = enrolledStudents.find(s => s.id === studentId);
                        sendSystemEmail('PARENT_ABSENT_ALERT', {
                            to_email: parent.email,
                            student_name: studentObj ? studentObj.full_name : 'Your Ward',
                            subject: activeSession.subject,
                            date: new Date().toLocaleDateString(),
                            portal_link: window.location.origin + '/login'
                        }).catch(e => console.error("Headless email failed", e));
                        
                        if (parent.phone) {
                            sendSystemWhatsApp(parent.phone, `[ATTENDANCE ALERT] Dear Parent, ${studentObj ? studentObj.full_name : 'your ward'} has been marked ABSENT for ${activeSession.subject} on ${new Date().toLocaleDateString()}. Please check the Parent Portal.`)
                            .catch(e => console.error("Headless WhatsApp failed", e));
                        }
                    }
                }
            }

        
            // Manual upsert for bulk
            let error = null;
            for (const payload of updates) {
                const { data: existing } = await supabase.from('attendance_records').select('id').eq('session_id', payload.session_id).eq('student_id', payload.student_id);
                if (existing && existing.length > 0) {
                    const { error: updErr } = await supabase.from('attendance_records').update(payload).eq('id', existing[0].id);
                    if (updErr) error = updErr;
                } else {
                    const { error: insErr } = await supabase.from('attendance_records').insert(payload);
                    if (insErr) error = insErr;
                }
            }
 if (error) throw error;

 // Update local state
 const newRecords = { ...attendanceRecords };
 filteredStudents.forEach(s => {
 newRecords[s.id] = { ...newRecords[s.id], ...(attendancePhase === 'entry' ? { entry_status: status } : { exit_status: status }), isNew: false };
 });
 setAttendanceRecords(newRecords);

 } catch (error) {
 console.error("Bulk mark failed:", error);
 window.erpDialog?.alert("Failed to perform bulk action.");
 } finally {
 setIsSaving(false);
 }
 };

 
    const generateLiveQR = () => {
        if (!activeSession) return;
        const token = `jsmerp_att_${Math.random().toString(36).substring(2, 15)}`;
        setQrCodeData({
            sessionToken: token,
            subject: activeSession.classData?.subject?.name || "Unknown",
            batch: activeSession.classData?.batch || "",
            expiresIn: 300
        });
        setShowQR(true);
    };


    const generateQR = async () => {
 try {
 const token = Math.random().toString(36).substring(2, 10).toUpperCase();
 const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60 secs

        const { error } = await supabase
 .from('class_sessions')
 .update({ qr_token: token, qr_expires_at: expiresAt })
 .eq('id', activeSession.id);
 
 if (error) throw error;

 setQrToken(token);
 setQrTimeLeft(60);
 setQrActive(true);
 
 } catch (error) {
 console.error("QR Generation failed:", error);
 }
 };
 
 const refreshLiveAttendance = async () => {
 try {
 const { data: existingRecords, error: recError } = await supabase
 .from('attendance_records')
 .select('*')
 .eq('session_id', activeSession.id);
 
 if (recError) throw recError;
 
 setAttendanceRecords(prev => {
 const next = { ...prev };
 existingRecords.forEach(r => {
 next[r.student_id] = r;
 });
 return next;
 });
 } catch (error) {
 console.error("Refresh failed:", error);
 }
 };

 const handleCloseSession = async () => {
 try {
 await supabase
 .from('class_sessions')
 .update({ status: 'completed', ended_at: new Date().toISOString(), qr_token: null })
 .eq('id', activeSession.id);
 
 setActiveSession(null);
 setEnrolledStudents([]);
 setAttendanceRecords({});
 fetchTodayClasses();
 fetchAllSubjects(); // Refresh past classes list
 
 if (window.erpDialog) {
     window.erpDialog.alert("Session finalized and saved successfully!", "success");
 } else {
     alert("Session finalized and saved successfully!");
 }
 } catch (error) {
 console.error("Failed to close:", error);
 }
 };

 

    
    useEffect(() => {
        // Disabled: Auto-wiring should only be done by Admins or via database migrations.
        const wireDataset = async () => {
            return;

            
            try {
                const facultyId = userSession?.db_id;
                if (!facultyId) return;

                
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
                                const dateStr = getLocalDateString(d);
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
                    
                    localStorage.setItem('wired_dataset_aug_17_v2', 'true');
                    window.location.reload();
                }
            } catch (err) {
                console.error(err);
            }
        };
        wireDataset();
    }, [userSession]);

    useEffect(() => {
        if (!activeSession?.id) return;
        
        const channel = supabase
            .channel('faculty-attendance-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'attendance_records', filter: `session_id=eq.${activeSession.id}` },
                (payload) => {
                    const newRecord = payload.new;
                    if (newRecord && newRecord.student_id) {
                        setAttendanceRecords(prev => ({
                            ...prev,
                            [newRecord.student_id]: {
                                status: newRecord.status,
                                isNew: false,
                                marked_by: newRecord.marked_by
                            }
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeSession?.id]);

    const filteredStudents = useMemo(() => {
 if (!searchQuery) return enrolledStudents;
 const q = searchQuery.toLowerCase();
 return enrolledStudents.filter(s => 
 s.full_name?.toLowerCase().includes(q) || 
 s.erp_id?.toLowerCase().includes(q) ||
 s.roll_number?.toLowerCase()?.includes(q)
 );
 }, [enrolledStudents, searchQuery]);

 const formatTime = (time) => time ? time.substring(0, 5) : '';

 return (
 <div className={`w-full ${!subjectContext ? 'animate-fade-in' : ''}`}>
 <div className={`${!subjectContext ? 'w-full max-w-[1800px] mx-auto flex flex-col gap-8 pb-32 xl:pb-8' : 'flex flex-col gap-4'}`}>
 
 {/* 1. HEADER (Liquid Glass) */}
 {(!subjectContext) && (
 <PageHeader 
 icon="fa-solid fa-user-check" 
 title="Attendance Engine" 
 subtitle="Manage automated class sessions, QR marking, and engagement analytics." 
 rightContent={
 <div className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar w-[calc(100vw-32px)] lg:w-fit gap-1">
 {[
 { id: "today", label: "Daily Sessions", icon: "fa-calendar-day" },
 { id: "window", label: "Active Window", icon: "fa-clipboard-check", disabled: !activeSession },
 { id: "unmarked", label: "Past Classes", icon: "fa-clock-rotate-left" },
 { id: "analytics", label: "Risk Analytics", icon: "fa-chart-pie" }
 ].map((tab) => (
 <button type="button"
 key={tab.id}
 disabled={tab.disabled}
 onClick={() => setActiveTab(tab.id)}
 className={`flex-1 min-w-[110px] px-5 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed ${activeTab === tab.id ? "bg-white dark:bg-themeElevated shadow-sm border border-black/5 dark:border-white/5 text-themeText dark:text-white" : "text-themeTextSec hover:text-themeText dark:hover:text-themeText border border-transparent hover:bg-black/5 dark:hover:bg-white/10"}`}
 >
 <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? '' : 'opacity-70'}`}></i>
 {tab.label}
 </button>
 ))}
 </div>
 }
 />
 )}

 {/* 2. DYNAMIC CONTENT AREA */}
 <div className="flex-1 w-full relative min-h-[500px]">
 
 {/* TODAY'S CLASSES VIEW */}
 {activeTab === 'today' && (
 <div className="flex flex-col gap-6 animate-fade-in">
 {!subjectContext && (
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center">
 <span className="text-4xl font-semibold tracking-tight text-themeText dark:text-themeText">{todayClasses.length}</span>
 <span className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider mt-1">Total</span>
 </div>
 <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
 <span className="text-4xl font-semibold tracking-tight text-emerald-500 relative z-10">{todayClasses.filter(c => c.session?.status === 'completed').length}</span>
 <span className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider mt-1 relative z-10">Done</span>
 </div>
 <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
 <span className="text-4xl font-semibold tracking-tight text-amber-500 relative z-10">{todayClasses.filter(c => c.session?.status !== 'completed').length}</span>
 <span className="text-[12px] font-bold text-themeTextSec uppercase tracking-wider mt-1 relative z-10">Live</span>
 </div>
 </div>
 )}

 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).length === 0 ? (
 <div className="w-full py-20 flex flex-col items-center justify-center bg-transparent rounded-[2rem] text-center px-4 border border-black/5 dark:border-white/5 border-dashed">
 <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6"><i className="fa-solid fa-mug-hot text-3xl text-themeTextSec dark:text-white/30"></i></div>
 <h3 className="text-xl font-semibold tracking-tight text-themeText dark:text-white">No Classes Today</h3>
 <p className="text-xs lg:text-sm text-themeTextSec dark:text-white/50 opacity-70 mt-2 max-w-xs mx-auto">Your timetable indicates you have a free day. Enjoy!</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {todayClasses.filter(c => subjectContext ? c.subject_id === subjectContext.id : true).map(cls => (
 <div key={cls.id} className="bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/5 p-5 flex flex-col hover:border-black/10 dark:hover:border-white/10 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-themeTextSec dark:text-white/50">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
 <span className="bg-black/5 dark:bg-white/5 backdrop-blur-xl px-2 py-0.5 rounded text-[12px] font-medium text-themeTextSec dark:text-white/50">Room {cls.room?.name || "TBD"}</span>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText dark:text-white leading-tight">{cls.subject?.name}</h3>
 <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 mt-1">{cls.batch} • Semester {cls.semester}</p>
 </div>
 {cls.session?.status === 'completed' ? (
        <button type="button" onClick={() => handleStartAttendance(cls)} className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 backdrop-blur-xl text-themeTextSec dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10 text-[13px] font-medium transition active:scale-[0.98]">
            View Completed Session
        </button>
    ) : (
 <button type="button" 
 onClick={() => handleStartAttendance(cls)}
                                                    className={`w-full py-3 rounded-xl text-[13px] font-medium transition ${cls.session?.status === 'completed' ? 'bg-white/10 text-themeTextSec dark:text-white/40 cursor-not-allowed' : 'bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white active:scale-[0.98]'}`}
 >
 {cls.session?.status === 'completed' ? 'Session Locked (Completed)' : cls.session?.status === 'ongoing' ? 'Resume Attendance' : 'Start Attendance Session'}
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ACTIVE WINDOW VIEW */}
 {activeTab === 'window' && activeSession && (
 <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 animate-fade-in relative z-10">
 {/* Left: Action Panel & QR */}
 <div className="w-full xl:w-[32%] flex flex-col gap-6 shrink-0">
 <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
 <div className="mb-8">
 <div className="flex flex-col gap-2 mb-2">
    <h2 className="text-2xl font-semibold tracking-tight text-themeText dark:text-themeText leading-tight">{activeSession.classData?.subject?.name}</h2>
    <div className="flex bg-black/5 dark:bg-white/5 rounded-lg p-0.5 border border-black/5 dark:border-white/5 shadow-inner w-fit">
        <button type="button" onClick={() => setAttendancePhase('entry')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${attendancePhase === 'entry' ? 'bg-white dark:bg-white/20 text-themeText dark:text-white shadow-sm' : 'text-themeTextSec hover:text-themeTextSec dark:text-white/50 dark:hover:text-white/70'}`}>Phase 1: Entry</button>
        <button type="button" onClick={() => setAttendancePhase('exit')} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${attendancePhase === 'exit' ? 'bg-white dark:bg-white/20 text-themeText dark:text-white shadow-sm' : 'text-themeTextSec hover:text-themeTextSec dark:text-white/50 dark:hover:text-white/70'}`}>Phase 2: Exit</button>
    </div>
</div>
 <div className="flex items-center gap-2">
 <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-themeTextSec">{activeSession.classData?.batch}</span>
 <span className="text-[12px] font-medium text-themeTextSec">{filteredStudents.length} Students</span>
 </div>
 
 <div className="mt-6 grid grid-cols-2 gap-2">
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider mb-1">Present (inc. Late)</p>
         <p className="text-xl font-semibold text-emerald-500">{Object.values(attendanceRecords).filter(r => ['present', 'late'].includes(attendancePhase === 'entry' ? r.entry_status : r.exit_status)).length}</p>
     </div>
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider mb-1">Absent</p>
         <p className="text-xl font-semibold text-rose-500">{Object.values(attendanceRecords).filter(r => (attendancePhase === 'entry' ? r.entry_status : r.exit_status) === 'absent').length}</p>
     </div>
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider mb-1">Medical</p>
         <p className="text-xl font-semibold text-amber-500">{Object.values(attendanceRecords).filter(r => (attendancePhase === 'entry' ? r.entry_status : r.exit_status) === 'medical').length}</p>
     </div>
     <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
         <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-wider mb-1">OTP Scans</p>
         <p className="text-xl font-semibold text-[#AF52DE]">{Object.values(attendanceRecords).filter(r => r.marked_by === 'student_qr').length}</p>
     </div>
 </div>
 
 </div>
 
 <div className="flex flex-col gap-3">
 {activeSession.status === 'completed' && (
     <div className="bg-amber-500/10 text-amber-500 text-[12px] font-bold p-3 rounded-xl text-center border border-amber-500/20">
         <i className="fa-solid fa-lock mr-2"></i>This session is finalized. Records are locked.
     </div>
 )}
 <button type="button" onClick={() => handleBulkMark('present')} disabled={isSaving || activeSession.status === 'completed'} className={`w-full py-4 rounded-xl text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] ${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-themeTextSec dark:text-white/40 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}>
 Mark All Present
 </button>
 <button type="button" onClick={() => handleBulkMark('absent')} disabled={isSaving || activeSession.status === 'completed'} className={`w-full py-4 rounded-xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] ${activeSession.status === 'completed' ? 'bg-transparent text-themeTextSec dark:text-white/40 cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-themeText dark:text-themeText'}`}>
 Mark All Absent
 </button>
 </div>
 </div>
 
 {/* Whiteboard OTP Generator */}
 <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 p-6 lg:p-8 text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
 <div className="absolute top-0 right-0 w-40 h-40 bg-[#AF52DE]/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
 <div className="w-14 h-14 mx-auto rounded-full bg-[#AF52DE]/10 border border-[#AF52DE]/20 text-[#AF52DE] flex items-center justify-center text-xl mb-4 relative z-10">
 <i className="fa-solid fa-expand"></i>
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-themeText dark:text-themeText mb-2 relative z-10">Whiteboard OTP</h3>
 <p className="text-[12px] font-medium text-themeTextSec mb-6 max-w-[220px] mx-auto relative z-10 leading-relaxed">Display this live code for students to mark themselves present.</p>
 
 {qrActive ? (
 <div className="bg-white dark:bg-themeElevated border border-black/5 dark:border-white/5 p-5 rounded-2xl flex flex-col items-center shadow-sm relative z-10">
 <div className="text-4xl font-semibold tracking-widest text-themeText dark:text-themeText font-mono mb-4">{qrToken}</div>
 <div className="w-full bg-black/5 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-3">
 <div className="h-full bg-[#AF52DE] transition-all ease-linear" style={{ width: `${(qrTimeLeft / 60) * 100}%` }}></div>
 </div>
 <p className="text-[10px] font-bold uppercase tracking-wider text-themeTextSec">{qrTimeLeft}s Remaining</p>
 </div>
 ) : (
 <div className="flex gap-2">
    <button type="button" onClick={generateQR} disabled={activeSession.status === 'completed'} className={`flex-1 py-4 rounded-xl text-[13px] lg:text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] relative z-10 ${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-themeTextSec cursor-not-allowed' : 'bg-[#AF52DE] hover:bg-[#9B49C4] text-white shadow-lg shadow-[#AF52DE]/20'}`}>
        Generate Live OTP
    </button>
    <button type="button" onClick={generateLiveQR} disabled={activeSession.status === 'completed'} className={`flex-1 py-4 rounded-xl text-[13px] lg:text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] relative z-10 ${activeSession.status === 'completed' ? 'bg-black/5 dark:bg-white/5 text-themeTextSec cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-themeText dark:text-themeText shadow-lg shadow-black/5'}`}>
        <i className="fa-solid fa-qrcode mr-2"></i> Live QR
    </button>
</div>
 )}
 </div>
 
 {activeSession.status === 'completed' ? (
    <button type="button" disabled className="w-full py-4.5 rounded-2xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight bg-transparent text-themeTextSec dark:text-white/40 cursor-not-allowed mt-auto flex items-center justify-center gap-2">
        <i className="fa-solid fa-lock text-[12px]"></i> Finalize & Lock Session
    </button>
) : (
    <div className="mt-auto w-full flex justify-center">
        <SlideCommit
          label="Slide to Finalize Session"
          doneLabel="Session Finalized"
          errorLabel="Finalization Failed"
          onConfirm={handleCloseSession}
          trackColor="rgba(28, 28, 30, 0.05)"
          handleColor="#007AFF"
          successColor="#10b981"
          dangerColor="#f43f5e"
          width="100%"
          height={56}
          radius={16}
        />
    </div>
)}
 </div>
 
 {/* Right: Roster List */}
 <div className="flex-1 flex flex-col h-[750px] bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
 <div className="p-5 lg:p-6 border-b border-black/5 dark:border-white/5 flex gap-4 bg-black/[0.02] dark:bg-white/[0.02] sticky top-0 z-10">
 <div className="relative flex-1">
 <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
 <input 
 type="text" 
 placeholder="Search by name, roll, or ID..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white dark:bg-themeElevated border border-black/5 dark:border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-[14px] font-medium text-themeText dark:text-themeText outline-none focus:border-[#007AFF] shadow-sm transition-colors placeholder-[#8E8E93]"
 />
 </div>
 <button type="button" onClick={() => setIsSwipeMode(!isSwipeMode)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-themeElevated border border-black/5 dark:border-white/5 rounded-xl hover:text-emerald-500 text-themeTextSec shadow-sm transition-all hover:scale-105 active:scale-95" title={isSwipeMode ? "Switch to List View" : "Switch to Tinder Swipe View"}>
 <i className={`fa-solid ${isSwipeMode ? 'fa-list-ul' : 'fa-layer-group'}`}></i>
 </button>
 <button type="button" onClick={refreshLiveAttendance} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-themeElevated border border-black/5 dark:border-white/5 rounded-xl hover:text-themeAccent text-themeTextSec shadow-sm transition-all hover:scale-105 active:scale-95" title="Sync live OTP entries">
 <i className="fa-solid fa-rotate-right"></i>
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
 {isSwipeMode ? (
    <SwipeableRosterDeck 
        students={filteredStudents} 
        attendanceRecords={attendanceRecords} 
        onMarkAttendance={updateAttendance} 
    />
) : (
    <>
{filteredStudents.map((student, index) => {
 const record = attendanceRecords[student.id] || { entry_status: 'absent', exit_status: null };
 
 const isPhaseOneSkipped = Object.values(attendanceRecords).every(r => r.isNew);
 const handleAction = (actionId) => {
     updateAttendance(student.id, actionId);
 };
 
 const getStatusColor = (status) => {
     if (status === 'present' || status === 'late') return '#10b981'; // emerald-500
     if (status === 'absent') return '#f43f5e'; // rose-500
     if (status === 'medical' || status === 'early_leave') return '#f59e0b'; // amber-500
     return 'transparent';
 };
 
 const currentStatus = attendancePhase === 'entry' ? record.entry_status : record.exit_status;
 const activeColor = getStatusColor(currentStatus);

 return (
    <React.Fragment key={student.id}>
        {/* DESKTOP VIEW (Manual buttons) */}
        <div className="hidden lg:flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors border-b border-black/5 dark:border-white/5 last:border-0 group">
            <div className="flex items-center gap-4">
                <div className="w-8 text-center text-[12px] font-bold text-themeTextSec opacity-60">{index + 1}</div>
                <div>
                    <p className="text-[16px] font-semibold tracking-tight text-themeText dark:text-themeText leading-tight mb-0.5">{student.full_name}</p>
                    <p className="text-[12px] font-medium text-themeTextSec">
                    {student.erp_id}
                    </p>
                </div>
            </div>
            
            <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/5 dark:border-white/5 shrink-0">
                {attendancePhase === 'entry' ? (
                <>
                    <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${record.entry_status === 'present' ? 'bg-white dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>P</button>
                    <button type="button" onClick={() => updateAttendance(student.id, 'absent')} disabled={activeSession.status === 'completed'} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${record.entry_status === 'absent' ? 'bg-white dark:bg-themeElevated text-rose-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>A</button>
                    <button type="button" onClick={() => updateAttendance(student.id, 'medical')} disabled={activeSession.status === 'completed'} className={`w-12 h-9 rounded-lg text-[13px] font-bold tracking-tight transition-all ${record.entry_status === 'medical' || record.entry_status === 'approved_leave' ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>M</button>
                </>
                ) : (
                <>
                {(() => {
                if (isPhaseOneSkipped) {
                    return (
                        <>
                            <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-white dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Stayed</button>
                            <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Left Early</button>
                        </>
                    );
                }
                if (record.entry_status === 'present' || record.entry_status === 'late') {
                    return (
                        <>
                            <button type="button" onClick={() => updateAttendance(student.id, 'present')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'present' ? 'bg-white dark:bg-themeElevated text-emerald-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Stayed</button>
                            <button type="button" onClick={() => updateAttendance(student.id, 'early_leave')} disabled={activeSession.status === 'completed'} className={`w-20 h-9 rounded-lg text-[12px] font-bold tracking-tight transition-all ${record.exit_status === 'early_leave' ? 'bg-white dark:bg-themeElevated text-amber-500 shadow-sm' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeText'}`}>Left Early</button>
                        </>
                    );
                }
                if (record.entry_status === 'absent') {
                    return (
                        <button type="button" onClick={() => updateAttendance(student.id, 'arrived_late')} className="w-[160px] h-9 rounded-lg text-[12px] font-bold tracking-tight flex items-center justify-center text-themeTextSec hover:text-amber-500 bg-black/5 dark:bg-white/5 hover:bg-white dark:hover:bg-themeElevated hover:shadow-sm transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5">
                            Mark as Arrived Late
                        </button>
                    );
                }
                return null;
                })()}
                </>
                )}
            </div>
        </div>

        {/* MOBILE VIEW (SwipeRow) */}
        <div className="block lg:hidden">
            <SwipeRow
                actions={
                    attendancePhase === 'entry' ? [
                        { id: 'absent', label: 'Absent', color: '#f43f5e', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
                        { id: 'present', label: 'Present', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true },
                        { id: 'medical', label: 'Medical', color: '#f59e0b', icon: <HugeiconsIcon icon={Add01Icon} size={20} />, dismiss: true }
                    ] : isPhaseOneSkipped || ['present', 'late'].includes(record.entry_status) ? [
                        { id: 'early_leave', label: 'Left Early', color: '#f59e0b', icon: <HugeiconsIcon icon={Cancel01Icon} size={20} /> },
                        { id: 'present', label: 'Stayed', color: '#10b981', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true }
                    ] : [
                        { id: 'arrived_late', label: 'Arrived Late', color: '#f59e0b', icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} />, dismiss: true }
                    ]
                }
                onCommit={(action) => handleAction(action.id)}
                onAction={(action) => handleAction(action.id)}
                actionColor={attendancePhase === 'entry' ? '#f43f5e' : '#f59e0b'} // Left-swipe primary action color
                drawerColor="rgba(0,0,0,0.8)"
                rowColor={currentStatus !== 'absent' && currentStatus ? activeColor + '1A' : 'transparent'} // subtle background for marked
                textColor="inherit"
                height={72}
                radius={16}
                actionWidth={80}
                direction="left"
                snapBounce={0.2}
                resistance={0.55}
                collapseMs={200}
                commitAt={0.5}
                fullSwipe={true}
                closeOnAction={true}
                disabled={activeSession.status === 'completed'}
                className="mb-2 border border-black/5 dark:border-white/5"
            >
                <div className="flex items-center gap-4 w-full cursor-pointer pl-2">
                    <div className="w-8 text-center text-[12px] font-bold text-themeTextSec opacity-60">{index + 1}</div>
                    <div className="flex-1">
                        <p className="text-[16px] font-semibold tracking-tight text-themeText dark:text-themeText leading-tight mb-0.5">{student.full_name}</p>
                        <p className="text-[12px] font-medium text-themeTextSec">{student.erp_id}</p>
                    </div>
                    <div className="shrink-0 flex gap-2">
                        {currentStatus === 'present' && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Present</span>}
                        {currentStatus === 'absent' && <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-bold">Absent</span>}
                        {(currentStatus === 'medical' || currentStatus === 'early_leave') && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">{currentStatus === 'medical' ? 'Medical' : 'Left Early'}</span>}
                        {currentStatus === 'late' && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">Late</span>}
                        {!currentStatus && <span className="bg-black/5 dark:bg-white/5 text-themeTextSec px-3 py-1 rounded-full text-xs font-bold">Unmarked</span>}
                    </div>
                </div>
            </SwipeRow>
        </div>
    </React.Fragment>
 );
})}</>
)}
 {filteredStudents.length === 0 && (
 <div className="text-center py-20 text-themeTextSec text-[13px] font-medium">No students found in this roster.</div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* RISK ANALYTICS VIEW */}
 
{showQR && qrCodeData && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4 animate-fade-in no-print">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#2a2a2a] p-10 rounded-2xl flex flex-col items-center max-w-lg w-full relative">
            <button type="button" onClick={() => setShowQR(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[#888888] hover:text-white bg-[#222222] rounded-full border border-white/5 transition-colors hover:scale-110">
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
            <div className="text-center mb-10">
                <h3 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">{qrCodeData.subject}</h3>
                <p className="text-emerald-500 font-bold tracking-widest uppercase text-sm">Official Roster Scan</p>
                <div className="inline-block mt-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/70 text-xs font-semibold">
                    Expires in {Math.floor(qrCodeData.expiresIn / 60)}:{(qrCodeData.expiresIn % 60).toString().padStart(2, '0')}
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.1)] relative">
                <QRCodeSVG value={JSON.stringify(qrCodeData)} size={280} level="H" includeMargin={false} />
            </div>
            <p className="mt-10 text-white/50 text-sm font-medium tracking-wide text-center">
                Students: Scan this code using the PCL Mobile App to instantly register your presence.
            </p>
        </div>
    </div>
)}

{activeTab === 'analytics' && (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-chart-line text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
 <h3 className="text-lg lg:text-xl text-themeText dark:text-white font-black">Analytics Engine Compiling...</h3>
 <p className="text-xs lg:text-sm text-themeTextSec dark:text-white/50 opacity-70 mt-2 max-w-sm mx-auto">This panel will aggregate data across all your subjects and automatically highlight students falling below the 75% engagement threshold.</p>
 </div>
 )}

{activeTab === 'unmarked' && (
 <div className="flex flex-col gap-6 animate-fade-in">
    {selectedUnmarkedSubject ? (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedUnmarkedSubject(null)} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-arrow-left text-themeTextSec dark:text-gray-300"></i>
                </button>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-themeText dark:text-themeText">{selectedUnmarkedSubject.name}</h2>
                    <p className="text-sm font-medium text-themeTextSec">{selectedUnmarkedSubject.code} • {selectedUnmarkedSubject.batch}</p>
                </div>
            </div>
            <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-themeTextSec mb-6">Past Classes (Last 30 Days)</h3>
                <div className="flex flex-col gap-3">
                    {selectedUnmarkedSubject.missed.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.isMarked ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                    <i className={`fa-solid ${m.isMarked ? 'fa-check text-emerald-500' : 'fa-calendar-xmark text-rose-500'}`}></i>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-themeText dark:text-white">{new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                                    <p className="text-xs font-medium text-themeTextSec">{m.time || '—'} • {m.batch || '—'}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => handleResolveUnmarked(m)} className={`text-[11px] font-black uppercase tracking-wider text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition active:scale-95 flex items-center gap-2 ${m.isMarked ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                <i className={`fa-solid ${m.isMarked ? 'fa-eye' : 'fa-pen-nib'}`}></i> {m.isMarked ? 'Review' : 'Mark Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ) : (
        unmarkedSubjects.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center bg-transparent border border-black/5 dark:border-white/5 border-dashed rounded-[2rem] text-center px-4">
                <i className="fa-solid fa-check-circle text-4xl text-emerald-500 mb-4"></i>
                <h3 className="text-lg text-themeText dark:text-white font-black">No Past Classes</h3>
                <p className="text-xs text-themeTextSec dark:text-white/50 mt-2 max-w-sm mx-auto">You have no scheduled past classes for any subjects in the last 30 days.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {unmarkedSubjects.map(sub => (
                    <div key={sub.id} onClick={() => setSelectedUnmarkedSubject(sub)} className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 cursor-pointer hover:border-amber-500/50 transition-colors group flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            {sub.missed.filter(x => !x.isMarked).length > 0 ? (
                                <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    {sub.missed.filter(x => !x.isMarked).length} Unmarked
                                </span>
                            ) : (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    All Marked
                                </span>
                            )}
                            <i className="fa-solid fa-arrow-right text-themeTextSec group-hover:text-amber-500 transition-colors"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-themeText dark:text-themeText leading-tight mb-1">{sub.name}</h3>
                            <p className="text-xs font-medium text-themeTextSec">{sub.code} • {sub.batch}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    )}
 </div>
)}
 
 </div>
 </div>
 </div>
 );
}
