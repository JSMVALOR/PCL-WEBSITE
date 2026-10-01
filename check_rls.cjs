const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { error } = await supabase.from('class_schedule').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    console.log("Delete error:", error ? error.message : "None");
}
run();
