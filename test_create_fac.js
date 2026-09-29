import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const { data: rpcUserId, error: authError } = await supabase.rpc('admin_create_user', {
        new_email: 'test_fac_prov@example.com',
        new_password: 'Password123!',
        new_role: 'faculty',
        new_erp_id: 'FAC9999',
        new_name: 'Test Fac',
        new_assignment: 'Law Dept'
    });
    console.log('RPC Result:', rpcUserId, authError);
}
test();
