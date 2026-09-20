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
    // try to fetch a faculty email
    const { data: fac } = await supabase.from('profiles').select('email').eq('role', 'faculty').limit(1).single();
    if (!fac) return console.log("No faculty");

    console.log("Faculty email:", fac.email);
    // Since we don't know the password, we can't easily log in via auth.signInWithPassword.
    // However, I can use an RPC or just try inserting via anon.
}
check();
