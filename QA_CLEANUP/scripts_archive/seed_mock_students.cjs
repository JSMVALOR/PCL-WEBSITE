const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
// Need service role key to bypass RLS or insert users. We can just insert into profiles with random UUIDs if RLS allows anon inserts, but wait, profiles are usually created via Auth. 
// We can insert directly if RLS is bypassed. I'll use ANON key and if it fails, I'll check for SERVICE_ROLE_KEY.
let serviceKey = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = line.split('=')[1].trim();
});
const supabase = createClient(url, serviceKey || key);
const crypto = require('crypto');

async function run() {
    const students = [];
    const namesI = ['Arjun Patel', 'Neha Sharma', 'Rohan Gupta', 'Priya Singh', 'Vikram Malhotra', 'Ananya Desai', 'Rahul Verma', 'Kavya Nair', 'Aditya Iyer', 'Sanya Kapoor'];
    const namesII = ['Aarav Mehta', 'Ishaan Joshi', 'Meera Reddy', 'Diya Menon', 'Karthik Pillai', 'Riya Bhatt', 'Dev Chauhan', 'Tara Sengupta', 'Kabir Das', 'Nisha Rao'];

    let erpIdCounter = 2026001;

    for (let i=0; i<namesI.length; i++) {
        students.push({
            id: crypto.randomUUID(),
            full_name: namesI[i],
            erp_id: `ERP${erpIdCounter++}`,
            role: 'student',
            academic_batch: 'LLB Section I',
        });
    }
    
    for (let i=0; i<namesII.length; i++) {
        students.push({
            id: crypto.randomUUID(),
            full_name: namesII[i],
            erp_id: `ERP${erpIdCounter++}`,
            role: 'student',
            academic_batch: 'LLB Section II',
        });
    }

    const { error } = await supabase.from('profiles').insert(students);
    if(error) console.error(error);
    else console.log(`Inserted ${students.length} students successfully.`);
}
run();
