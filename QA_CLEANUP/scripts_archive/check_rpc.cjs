const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

async function run() {
    const res = await fetch(`${url}/rest/v1/`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const data = await res.json();
    console.log("Available paths:", Object.keys(data.paths).filter(p => p.startsWith('/rpc')));
}
run();
