require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { error } = await supabase.from('attendance_audit_logs').insert([{
        faculty_id: '123e4567-e89b-12d3-a456-426614174000',
        date: '2026-10-02',
        admin_id: '123e4567-e89b-12d3-a456-426614174000',
        previous_status: 'pending',
        new_status: 'present',
        action_reason: 'Test'
    }]);
    console.log("Insert Error:", error);
}
test();
