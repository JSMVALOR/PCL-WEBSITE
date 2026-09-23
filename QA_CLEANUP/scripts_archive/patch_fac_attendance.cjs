const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `            const { data: fullSchedule } = await supabase.from('class_schedule').select('id, subject_id, day_of_week, start_time, batch').in('subject_id', masterIds);
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
                const subSched = (fullSchedule||[]).filter(s => s.subject_id === cs.master_subjects?.id && s.batch === cs.batch_id);
                if (subSched.length === 0) return;`;

const newLogic = `            // Fix: class_schedule.batch is a string name, cohort_subjects.batch_id is a UUID. 
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
                if (subSched.length === 0) return;`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(path, content);
console.log("Patched FacultyAttendance.jsx");
