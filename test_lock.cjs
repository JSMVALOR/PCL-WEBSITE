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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/marks_submissions`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({
      faculty_id: "fac00000-0000-0000-0000-000000000000",
      subject_id: "9c822743-fb52-4463-b951-7cdd58c00f88",
      batch: "test",
      assessment_type: "test",
      submitted_at: new Date().toISOString()
    })
  });
  const data = await res.text();
  console.log('Insert response:', res.status, data);
}
check();
