import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const provisionClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data, error } = await provisionClient.rpc('get_schema_info_or_something'); // not possible, I'll just check by trying to insert a random UUID
    const id = 'd279cf4a-5f33-4f27-a9a7-9c98bc01d14e';
    const { error: profileErr } = await provisionClient.from('profiles').insert([{
        id,
        role: 'faculty',
        erp_id: 'FAC-0008',
        email: 'pavitra@prudentia.edu',
        full_name: 'Prof. Pavitra',
        status: 'active',
        department: 'English'
    }]);
    console.log(profileErr);
}
run();
