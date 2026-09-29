import fs from 'fs';

function run() {
    const data = JSON.parse(fs.readFileSync('debug_data.json', 'utf8'));
    const msData = data.msData;
    const pData = data.pData;
    
    const mapping = [
        { subject: 'ENGLISH', faculty: 'Pavithra' },
        { subject: 'FAMILY LAW', faculty: 'Supriya' },
        { subject: 'CONSTITUTIONAL LAW', faculty: 'Supriya' },
        { subject: 'HISTORY OF COURTS', faculty: 'Tarun' },
        { subject: 'LAW OF TORTS', faculty: 'Tarun' },
        { subject: 'ENVIRONMENTAL LAW', faculty: 'Bhumika' },
        { subject: 'LAW OF CONTRACT', faculty: 'Bhumika' },
        { subject: 'FINANCIAL ACCOUNTING', faculty: 'Pranay' },
        { subject: 'BUSINESS ECONOMICS', faculty: 'Pranay' },
        { subject: 'PRINCIPLES OF MANAGEMENT', faculty: 'Sneha' }
    ];
    
    let sql = `-- FINAL FACULTY ALLOCATION FIXES\n`;
    
    for (let map of mapping) {
        let fac = pData.find(p => p.full_name && p.full_name.toLowerCase().includes(map.faculty.toLowerCase()));
        if (!fac && map.faculty === 'Pavithra') {
            fac = { id: 'db666fb4-a532-47dc-a42d-2098b0f19c8f' };
        }
        
        if (fac) {
            let subjects = msData.filter(m => (m.subject_name && m.subject_name.toLowerCase().includes(map.subject.toLowerCase())) || (m.name && m.name.toLowerCase().includes(map.subject.toLowerCase())));
            for (let sub of subjects) {
                sql += `UPDATE public.cohort_subjects SET faculty_id = '${fac.id}' WHERE master_subject_id = '${sub.id}';\n`;
                sql += `UPDATE public.class_schedule SET faculty_id = '${fac.id}' WHERE subject_id = '${sub.id}';\n`;
            }
        }
    }
    
    fs.writeFileSync('Backend/all_pending_fixes.sql', sql);
    console.log("SQL fixes generated!");
}
run();
