const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('moot_competitions').select('*').limit(1);
    console.log("moot_competitions:", error || Object.keys(data[0] || {}));
    
    const { data: d2, error: e2 } = await supabase.from('moot_bids').select('*').limit(1);
    console.log("moot_bids:", e2 || Object.keys(d2[0] || {}));
}
check();
