require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const res = await supabase.from('mentorship_messages').select('attachment_url').limit(1);
    console.log(res);
}
test();
