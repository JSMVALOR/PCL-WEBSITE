const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function check() {
    console.log("Checking columns by intentionally triggering an error to see type mismatches...");
    
    // We will query limit 1 and look at the first row to determine column types
    const { data: d1 } = await supabase.from('assignments').select('student_id').limit(1);
    const { data: d2 } = await supabase.from('mentorship').select('student_id').limit(1);
    const { data: d3 } = await supabase.from('attendance').select('profile_id').limit(1);

    console.log("Assignments schema sample:", d1);
    console.log("Mentorship schema sample:", d2);
    console.log("Attendance schema sample:", d3);
}
check();
