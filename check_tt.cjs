const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
    const { data: schedule, error } = await supabase.from('class_schedule').select('*');
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total slots: ${schedule.length}`);
    
    // Group by faculty -> day -> start_time
    const facultyMap = {};
    const violations = [];

    for (const slot of schedule) {
        if (!slot.faculty_id) continue;
        const key = `${slot.faculty_id}_${slot.day_of_week}_${slot.start_time}`;
        if (!facultyMap[key]) {
            facultyMap[key] = [];
        }
        facultyMap[key].push(slot);
        
        if (facultyMap[key].length > 1) {
            violations.push(facultyMap[key]);
        }
    }

    if (violations.length === 0) {
        console.log("✅ No faculty double-booking violations found in the database.");
    } else {
        console.log(`❌ Found ${violations.length} faculty double-booking violations!`);
        console.log(violations[0].map(v => `${v.batch}: ${v.subject_id} @ ${v.start_time}`));
        
        // Fix them by deleting the duplicates
        let deleteIds = [];
        for (const viol of violations) {
            // Keep the first one, delete the rest
            for (let i = 1; i < viol.length; i++) {
                deleteIds.push(viol[i].id);
            }
        }
        console.log(`Deleting ${deleteIds.length} duplicate slots to fix the clubbing...`);
        const { error: delErr } = await supabase.from('class_schedule').delete().in('id', deleteIds);
        if (delErr) console.error("Failed to delete duplicates", delErr);
        else console.log("Successfully fixed the timetable clubbing violations.");
    }
})();
