const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envPath = '.env';
let url = '', key = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    if (urlMatch) url = urlMatch[1].trim();
    if (keyMatch) key = keyMatch[1].trim();
}

async function run() {
    // using raw psql or REST api? We can fetch the swagger api to see constraints.
    const res = await fetch(`${url}/rest/v1/class_sessions?limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    console.log(res.status, res.statusText);
}
run();
