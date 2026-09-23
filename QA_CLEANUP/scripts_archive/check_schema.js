import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'notifications' });
  if (error) {
    console.error("RPC Error:", error.message);
    
    // Fallback: just fetch one row or error
    const res = await supabase.from('notifications').select('*').limit(1);
    console.log(res);
  } else {
    console.log("Columns:", data);
  }
}
check();
