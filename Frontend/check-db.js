import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('admissions_applications').select('*');
  console.log("Error:", error?.message);
  console.log("Count:", data?.length);
  if (data?.length > 0) console.log("First row name:", data[0].name);
}
check();
