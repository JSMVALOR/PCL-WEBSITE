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
const supabase = createClient(url, key);

async function check() {
    const { error } = await supabase.from('class_sessions').insert({}).select('*').single();
    console.log("Empty insert error:", error);
}
check();
