const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { error } = await supabase.from('profiles').select('faculty_type').limit(1);
    console.log("Profiles faculty_type:", error || "Success");
}
run();
