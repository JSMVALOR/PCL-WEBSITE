import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
    const { data, error } = await supabase.auth.signInWithPassword({ email: 'JSMVALOR@GMAIL.COM', password: 'wrong' });
    console.log(error ? error.message : "Success");
}
test();
