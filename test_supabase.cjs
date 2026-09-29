require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase.from('system_settings').upsert({ key: 'academic_calendar_grid', value: { columns: ['Date', 'Day', 'Event'], rows: [{id: '1', data: {Date: 'test', Day: 'test', Event: 'test'}}] } }, { onConflict: 'key' }).select();
    console.log("Error:", error);
    console.log("Data:", data);
}
test();
