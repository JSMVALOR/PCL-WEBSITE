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
  const { data } = await supabase.from('admin_notices').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("admin_notices columns:", Object.keys(data[0]));
  } else {
    // try inserting invalid column to see error
    const { error } = await supabase.from('admin_notices').insert([{fake_col: 1}]);
    console.log(error);
  }
}
check();
