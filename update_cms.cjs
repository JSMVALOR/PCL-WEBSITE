require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('website_content').select('*');
    if (error) {
        console.error("DB error:", error);
        return;
    }
    
    let updatedCount = 0;
    for (let row of data) {
        if (row.content) {
            let changed = false;
            let str = JSON.stringify(row.content);
            if (str.includes('Secretary')) {
                str = str.replace(/Secretary/g, 'Managing Director');
                changed = true;
            }
            if (changed) {
                await supabase.from('website_content').update({ content: JSON.parse(str) }).eq('id', row.id);
                updatedCount++;
            }
        }
    }
    console.log('Updated ' + updatedCount + ' rows in website_content.');
}
run();
