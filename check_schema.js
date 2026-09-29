import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { error } = await supabase.from('profiles').update({ status: 'Active' }).eq('id', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c');
  console.log(error);
}
run();
