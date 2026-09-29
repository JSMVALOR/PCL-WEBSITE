require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function sync() {
    console.log("Fetching faculty profiles...");
    const { data: faculty, error } = await supabase.from('faculty_profiles').select('id, image_url');
    if (error) throw error;
    
    let updated = 0;
    for (const fac of faculty) {
        if (fac.image_url) {
            console.log(`Syncing image for faculty ${fac.id}...`);
            const { error: updErr } = await supabase.from('profiles').update({ profile_picture_url: fac.image_url }).eq('id', fac.id);
            if (updErr) console.error(updErr);
            else updated++;
        }
    }
    console.log(`Synced ${updated} faculty images to profiles.`);
}
sync().catch(console.error);
