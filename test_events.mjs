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
  const res1 = await supabase.from('academic_calendar').select('*').limit(1);
  console.log("academic_calendar error:", res1.error);
  
  const res2 = await supabase.from('academic_events').select('*').limit(1);
  console.log("academic_events error:", res2.error);
}
check();
