import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const { data, error } = await supabase.rpc('get_email_by_erp_id', { target_erp_id: 'test' });
    // Actually we can't easily query pg_trigger from anon.
}
test();
