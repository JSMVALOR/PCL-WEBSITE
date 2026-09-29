import fs from 'fs';

function generateTimetables() {
    const data = JSON.parse(fs.readFileSync('debug_data.json', 'utf8'));
    const { msData, bData, pData } = data;

    function findFac(name) {
        if (name === 'Pavithra') return 'db666fb4-a532-47dc-a42d-2098b0f19c8f';
        let match = pData.find(p => p.full_name && p.full_name.toLowerCase().includes(name.toLowerCase()));
        return match ? match.id : null;
    }

    function findSub(name, progId) {
        let match = msData.find(m => m.program_id === progId && 
            ((m.subject_name && m.subject_name.toLowerCase().includes(name.toLowerCase())) || 
             (m.name && m.name.toLowerCase().includes(name.toLowerCase())))
        );
        if (!match) {
            console.error(`Could not find subject ${name} for program ${progId}`);
            return msData.find(m => m.program_id === progId).id;
        }
        return match.id;
    }

    let sql = `-- EXACT TIMETABLE GENERATION\n\n`;
    sql += `DELETE FROM public.class_schedule;\n`;
    sql += `DELETE FROM public.cohort_subjects;\n\n`;

    const cohortMap = new Map();

    let baLlbBatch = bData.find(b => b.name === 'BA LLB (Class of 2031)');
    let baLlbProgId = baLlbBatch.program_id;
    let facBaLlb = {
        'ENGLISH': findFac('Pavithra'),
        'INDIAN HISTORY': findFac('Bhumika'), 
        'POLITICAL SCIENCE': findFac('Supriya'),
        'LEGAL LANGUAGE': findFac('Pranay'),
        'HISTORY OF COURTS': findFac('Tarun')
    };

    const baLlbTimetable = [
        ['ENGLISH', 'INDIAN HISTORY', 'POLITICAL SCIENCE', 'LEGAL LANGUAGE', 'HISTORY OF COURTS'],
        ['ENGLISH', 'INDIAN HISTORY', 'POLITICAL SCIENCE', 'LEGAL LANGUAGE', 'HISTORY OF COURTS'],
        ['ENGLISH', 'INDIAN HISTORY', 'POLITICAL SCIENCE', 'LEGAL LANGUAGE', 'HISTORY OF COURTS'],
        ['ENGLISH', 'INDIAN HISTORY', 'POLITICAL SCIENCE', 'LEGAL LANGUAGE', 'HISTORY OF COURTS'],
        ['ENGLISH', 'INDIAN HISTORY', 'POLITICAL SCIENCE', 'LEGAL LANGUAGE', 'HISTORY OF COURTS']
    ];

    let bbaLlbBatch = bData.find(b => b.name === 'BBA LLB (Class of 2031)');
    let bbaLlbProgId = bbaLlbBatch.program_id;
    let facBbaLlb = {
        'ENGLISH': findFac('Pavithra'),
        'PRINCIPLES OF MANAGEMENT': findFac('Sneha'),
        'BUSINESS ECONOMICS': findFac('Pranay'),
        'FINANCIAL ACCOUNTING': findFac('Pranay'),
        'HISTORY OF COURTS': findFac('Tarun')
    };
    
    const bbaLlbTimetable = [
        ['ENGLISH', 'PRINCIPLES OF MANAGEMENT', 'BUSINESS ECONOMICS', 'FINANCIAL ACCOUNTING', 'HISTORY OF COURTS'],
        ['ENGLISH', 'PRINCIPLES OF MANAGEMENT', 'BUSINESS ECONOMICS', 'FINANCIAL ACCOUNTING', 'HISTORY OF COURTS'],
        ['ENGLISH', 'PRINCIPLES OF MANAGEMENT', 'BUSINESS ECONOMICS', 'FINANCIAL ACCOUNTING', 'HISTORY OF COURTS'],
        ['ENGLISH', 'PRINCIPLES OF MANAGEMENT', 'BUSINESS ECONOMICS', 'FINANCIAL ACCOUNTING', 'HISTORY OF COURTS'],
        ['ENGLISH', 'PRINCIPLES OF MANAGEMENT', 'BUSINESS ECONOMICS', 'FINANCIAL ACCOUNTING', 'HISTORY OF COURTS']
    ];

    let llbI = bData.find(b => b.name === 'LLB (Class of 2029) - Section I');
    let llbII = bData.find(b => b.name === 'LLB (Class of 2029) - Section II');
    let llbProgId = llbI.program_id;
    
    let facLlb = {
        'CONSTITUTIONAL LAW': findFac('Supriya'),
        'FAMILY LAW': findFac('Supriya'),
        'LAW OF TORTS': findFac('Tarun'),
        'ENVIRONMENTAL LAW': findFac('Bhumika'),
        'LAW OF CONTRACT': findFac('Bhumika')
    };

    const llbTimetable = [
        ['ENVIRONMENTAL LAW', 'LAW OF CONTRACT', 'FAMILY LAW', 'CONSTITUTIONAL LAW', 'LAW OF TORTS'],
        ['ENVIRONMENTAL LAW', 'LAW OF CONTRACT', 'FAMILY LAW', 'CONSTITUTIONAL LAW', 'LAW OF TORTS'],
        ['ENVIRONMENTAL LAW', 'LAW OF CONTRACT', 'FAMILY LAW', 'CONSTITUTIONAL LAW', 'LAW OF TORTS'],
        ['ENVIRONMENTAL LAW', 'LAW OF CONTRACT', 'FAMILY LAW', 'CONSTITUTIONAL LAW', 'LAW OF TORTS'],
        ['ENVIRONMENTAL LAW', 'LAW OF CONTRACT', 'FAMILY LAW', 'CONSTITUTIONAL LAW', 'LAW OF TORTS']
    ];

    function genSchedule(batchName, batchId, progId, timetable, facMap) {
        let values = [];
        let timeSlots = [
            { s: '09:00:00', e: '09:45:00' },
            { s: '09:50:00', e: '10:35:00' },
            { s: '10:50:00', e: '11:35:00' },
            { s: '11:40:00', e: '12:25:00' },
            { s: '12:25:00', e: '13:20:00' },
            { s: '14:00:00', e: '14:45:00' },
            { s: '14:50:00', e: '15:35:00' }
        ];

        for (let d = 0; d < 5; d++) {
            let daySubjects = timetable[d];
            for (let t = 0; t < timeSlots.length; t++) {
                let subName = daySubjects[t % daySubjects.length];
                let subId = findSub(subName, progId);
                let facId = facMap[subName] || null;
                
                cohortMap.set(`${batchId}_${subId}`, { batchId, subId, facId });
                // We use 'batch' instead of batch_name, and omit batch_id
                values.push(`('${batchName}', '${subId}', ${facId ? `'${facId}'` : 'NULL'}, ${d + 1}, '${timeSlots[t].s}', '${timeSlots[t].e}', 'Scheduled')`);
            }
        }
        return values;
    }

    let allValues = [];
    allValues.push(...genSchedule(baLlbBatch.name, baLlbBatch.id, baLlbProgId, baLlbTimetable, facBaLlb));
    allValues.push(...genSchedule(bbaLlbBatch.name, bbaLlbBatch.id, bbaLlbProgId, bbaLlbTimetable, facBbaLlb));
    allValues.push(...genSchedule(llbI.name, llbI.id, llbProgId, llbTimetable, facLlb));
    allValues.push(...genSchedule(llbII.name, llbII.id, llbProgId, llbTimetable, facLlb));

    sql += `INSERT INTO public.class_schedule (batch, subject_id, faculty_id, day_of_week, start_time, end_time, status) VALUES\n`;
    sql += allValues.join(',\n') + ';\n\n';

    sql += `INSERT INTO public.cohort_subjects (batch_id, master_subject_id, faculty_id) VALUES\n`;
    let cohortVals = [];
    for (let [key, val] of cohortMap.entries()) {
        cohortVals.push(`('${val.batchId}', '${val.subId}', ${val.facId ? `'${val.facId}'` : 'NULL'})`);
    }
    sql += cohortVals.join(',\n') + ';\n\n';

    sql += `-- =======================================================\n`;
    sql += `-- ADD PROF. PAVITHRA TO SYSTEM (AUTH, PROFILE, FACULTY)\n`;
    sql += `-- =======================================================\n\n`;
    sql += `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user) VALUES\n`;
    sql += `('db666fb4-a532-47dc-a42d-2098b0f19c8f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pavithra@prudentia.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Ms. V. Pavithra","role":"faculty"}', false, false) ON CONFLICT (id) DO NOTHING;\n\n`;
    
    sql += `INSERT INTO public.profiles (id, erp_id, full_name, email, role, department, status, profile_picture_url) VALUES\n`;
    sql += `('db666fb4-a532-47dc-a42d-2098b0f19c8f', 'FAC-0008', 'Ms. V. Pavithra', 'pavithra@prudentia.edu', 'faculty', 'English', 'active', '/assets/people/ms_v_pavithra.jpg') ON CONFLICT (id) DO NOTHING;\n\n`;
    
    sql += `INSERT INTO public.faculty_profiles (id, designation, image_url, is_public, bio, education, research, experience) VALUES\n`;
    sql += `('db666fb4-a532-47dc-a42d-2098b0f19c8f', 'Lecturer', '/assets/people/ms_v_pavithra.jpg', true, 'Ms. V. Pavithra is a lecturer at Prudentia College of Law...', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) ON CONFLICT (id) DO NOTHING;\n\n`;

    fs.writeFileSync('Backend/timetables.sql', sql);
    console.log("timetables.sql OVERWRITTEN WITH PERFECT COLUMNS");
}

generateTimetables();
