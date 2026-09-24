import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key] = rest.join('=');
  }
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('marks_ledger')
    .select('marks_obtained, student:profiles!marks_ledger_student_id_fkey(roll_number, full_name, erp_id)')
    .limit(1);
    
  console.log("Error:", error);
  console.log("Data:", data);
}
check();
