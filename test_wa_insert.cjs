require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('whatsapp_queue').insert({
       phone: '1203632938475949@g.us',
       message: 'Test message',
       status: 'PENDING'
    });
    if (error) {
       console.error("DB Error:", error);
    } else {
       console.log("Success!");
    }
}
run();
