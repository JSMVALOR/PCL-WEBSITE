require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function patch() {
    const { error } = await supabase
        .from('campus_timings')
        .update({ start_time: '08:45:00', end_time: '16:45:00' })
        .eq('setting_type', 'working_days');
    if (error) console.error(error);
    else console.log('Patched campus timings successfully.');
}
patch();
