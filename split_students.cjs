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
    const { data: students } = await supabase.from('profiles').select('id, full_name, academic_batch').eq('role', 'student').eq('academic_batch', 'LLB (Class of 2029)');
    
    if(!students || students.length === 0) {
        console.log("No students found in 'LLB (Class of 2029)'");
        return;
    }
    
    const half = Math.floor(students.length / 2);
    for(let i=0; i<students.length; i++) {
        const batchName = i < half ? 'LLB Section I' : 'LLB Section II';
        await supabase.from('profiles').update({ academic_batch: batchName }).eq('id', students[i].id);
    }
    
    console.log(`Updated ${students.length} students into LLB Section I and LLB Section II`);
}
run();
