const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data, error } = await supabase.rpc('admin_create_user', { new_email: 'test@example.com', new_password: 'test', new_role: 'student', new_name: 'test', new_erp_id: 'test', new_assignment: null, student_name: null });
    console.log(data || error);
}
run();
