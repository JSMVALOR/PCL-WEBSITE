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

const COLORS = ['blue', 'emerald', 'purple', 'orange', 'rose', 'amber', 'cyan', 'pink', 'fuchsia'];

async function updateColors() {
    const { data: subjects } = await supabase.from('master_subjects').select('id, theme_color');
    let count = 0;
    
    // Distribute colors nicely
    let colorIndex = 0;
    for (const sub of subjects) {
        if (['indigo', 'slate', 'gray'].includes(sub.theme_color) || !sub.theme_color) {
            const nextColor = COLORS[colorIndex % COLORS.length];
            await supabase.from('master_subjects').update({ theme_color: nextColor }).eq('id', sub.id);
            colorIndex++;
            count++;
        }
    }
    console.log(`Assigned vibrant colors to ${count} subjects.`);
}
updateColors();
