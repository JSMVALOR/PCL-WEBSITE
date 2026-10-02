require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data } = await supabase.from('campus_timings').select('*');
    console.log(JSON.stringify(data, null, 2));
}
test();
