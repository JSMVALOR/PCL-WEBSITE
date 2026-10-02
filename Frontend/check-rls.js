import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  // Let's sign in if we can to test authenticated fetch.
  // Actually, we can just fetch without auth.
  const { data, error } = await supabase.from('admissions_applications').select('*');
  console.log("Anon Fetch Error:", error?.message);
  console.log("Anon Fetch Count:", data?.length);
}
check();
