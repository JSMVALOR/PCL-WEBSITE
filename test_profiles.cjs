const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    // Try to select the specific columns to see if they exist
    const { data, error } = await supabase.from('profiles').select('id, phone, department, faculty_type, is_public').limit(1);
    console.log("Profiles check:", error || "Success");
    
    // Also check faculty_profiles
    const { data: data2, error: err2 } = await supabase.from('faculty_profiles').select('id, designation, specialisation, is_public, phone').limit(1);
    console.log("Faculty_profiles check:", err2 || "Success");
}
run();
