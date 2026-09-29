import fs from 'fs';
function run() {
    const data = JSON.parse(fs.readFileSync('debug_data.json', 'utf8'));
    // Find BBA LLB batch ID
    const bba = data.bData.find(b => b.name === 'BBA LLB (Class of 2031)');
    console.log("BBA LLB Batch ID:", bba.id);
    
    // Find cohort_subjects for this batch
    const cs = data.csData.filter(c => c.batch_id === bba.id);
    console.log("Cohort Subjects for BBA:", cs);
    
    // Find master subjects for these cohort subjects
    for (let c of cs) {
        let m = data.msData.find(m => m.id === c.master_subject_id);
        console.log(`- ${m.subject_name || m.name}: faculty_id=${c.faculty_id}`);
    }
}
run();
