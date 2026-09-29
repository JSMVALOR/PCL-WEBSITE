require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixId() {
    console.log("Fetching profiles with a dash in erp_id...");
    const { data: profiles, error } = await supabase.from('profiles').select('id, erp_id, full_name').like('erp_id', '%-%');
    if (error) throw error;
    
    for (const p of profiles) {
        if (p.erp_id.startsWith('FAC-') || p.erp_id.startsWith('LIB-')) {
            const newId = p.erp_id.replace('-', '');
            console.log(`Updating ${p.full_name} from ${p.erp_id} to ${newId}`);
            const { error: updErr } = await supabase.from('profiles').update({ erp_id: newId }).eq('id', p.id);
            if (updErr) console.error(updErr);
        }
    }
    console.log("Done.");
}
fixId().catch(console.error);
