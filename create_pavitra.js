import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
    // 1. Create auth user
    const { data: authData, error: authErr } = await provisionClient.auth.signUp({
        email: 'pavitra@prudentia.com',
        password: 'Password123!',
        options: { data: { role: 'faculty', erp_id: 'FAC-0008', name: 'Prof. Pavitra' } }
    });
    if (authErr) console.error("Auth err:", authErr);
    else {
        const id = authData.user.id;
        const { error: profileErr } = await provisionClient.from('profiles').upsert([{
            id,
            role: 'faculty',
            erp_id: 'FAC-0008',
            email: 'pavitra@prudentia.com',
            full_name: 'Prof. Pavitra',
            status: 'active',
            department: 'English'
        }]);
        if (profileErr) console.error("Profile err:", profileErr);
        else console.log("Created Pavitra with ID:", id);
    }
}
run();
