const fs = require('fs');
const envStr = fs.readFileSync('.env', 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
  if (line && line.includes('=')) {
    const [k, v] = line.split('=');
    env[k.trim()] = v.trim();
  }
});
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_KEY;

async function check() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cohort_subjects?faculty_id=eq.fac00000-0000-0000-0000-000000000000`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  });
  const data = await res.json();
  console.log('directSubs IDs:', data.map(s => s.id));
}
check();
