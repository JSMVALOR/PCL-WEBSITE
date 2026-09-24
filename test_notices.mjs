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
  const res1 = await supabase.from('notices').select('*').limit(1);
  console.log("notices columns:", Object.keys(res1.data[0] || {}));

  const res2 = await supabase.from('admin_notices').select('*').limit(1);
  console.log("admin_notices error:", res2.error);
  if(res2.data) console.log("admin_notices columns:", Object.keys(res2.data[0] || {}));
}
check();
