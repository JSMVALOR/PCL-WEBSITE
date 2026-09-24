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
  const { data, error } = await supabase.from('class_sessions').select('*').limit(1);
  console.log("class_sessions:");
  console.dir(data, {depth: null});
  if (error) console.error("Error:", error);
  
  const { data: d2, error: e2 } = await supabase.from('marks_ledger').select('*, cohort_subjects(master_subjects(name, code))').limit(1);
  console.log("marks_ledger error:", e2);
}
check();
