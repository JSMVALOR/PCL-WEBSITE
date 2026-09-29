import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const email = 'test_provisioning@example.com';
    const password = 'Password123!';
    
    console.log('Calling RPC...');
    const { data: rpcUserId, error: authError } = await supabase.rpc('admin_create_user', {
        new_email: email,
        new_password: password,
        new_role: 'student',
        new_erp_id: '99BAL9999',
        new_name: 'Test Provision',
        new_assignment: 'TEST BATCH'
    });
    
    console.log('RPC Result:', rpcUserId, authError);
    
    console.log('Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    console.log('Login Error:', error ? error.message : "SUCCESS!");
}
test();
