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
    const { data: b1 } = await supabase.from('batches').select('*');
    const { data: b2 } = await supabase.from('academic_batches').select('*');
    const { data: b3 } = await supabase.from('student_batches').select('*');
    
    console.log("batches:", b1);
    console.log("academic_batches:", b2);
    console.log("student_batches:", b3);
}
run();
