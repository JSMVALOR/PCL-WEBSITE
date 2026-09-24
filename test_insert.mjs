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
  const { error } = await supabase.from('academic_calendar').insert([{
        title: "Test",
        start_date: "2026-10-10",
        end_date: "2026-10-11",
        event_type: "academic",
        description: "Test"
      }]);
  console.log("Insert error:", error);
}
check();
