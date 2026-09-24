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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_ANON_KEY}`);
  const data = await res.json();
  const def = (data.definitions && data.definitions.marks_submissions) || (data.components && data.components.schemas && data.components.schemas.marks_submissions);
  if (def) {
    console.log('Columns:', Object.keys(def.properties));
  } else {
    console.log('Table marks_submissions not found. Keys:', Object.keys(data.definitions || data.components.schemas || {}));
  }
}
check();
