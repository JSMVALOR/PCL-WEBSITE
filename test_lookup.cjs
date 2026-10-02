const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data, error } = await supabase.rpc('get_email_by_erp_id', { target_erp_id: 'fac1007' });
    console.log("Lookup result:", data, "Error:", error);
}
run();
