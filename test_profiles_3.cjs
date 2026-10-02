const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { error } = await supabase.from('profiles').select('phone').limit(1);
    console.log("Profiles phone:", error || "Success");
}
run();
