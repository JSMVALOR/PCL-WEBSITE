import re

with open('src/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx', 'r') as f:
    content = f.read()

wire_script = """
    useEffect(() => {
        const wireDataAsAdmin = async () => {
            if (localStorage.getItem('admin_wired_dataset_v3')) return;
            console.log("Admin Auto-wiring Dataset...");
            try {
                // 1. Get LLB Batch
                const { data: batches } = await supabase.from('academic_batches').select('id').ilike('name', '%LLB (Class of 2029)%').limit(1);
                const batchId = batches?.[0]?.id;
                if (!batchId) return;

                // 2. Get Faculties
                const { data: faculties } = await supabase.from('profiles').select('id').eq('role', 'faculty');
                if (!faculties || faculties.length === 0) return;

                // 3. Get Subjects
                const { data: subjects } = await supabase.from('master_subjects').select('id, code').ilike('code', '%LLB 10%');
                if (!subjects || subjects.length === 0) return;
                
                const sub1 = subjects.find(s => s.code.includes('102'))?.id || subjects[0].id;
                const sub2 = subjects.find(s => s.code.includes('103'))?.id || subjects[0].id;
                const sub3 = subjects.find(s => s.code.includes('104'))?.id || subjects[0].id;

                // 4. Assign ALL faculties to these subjects for this batch
                const cohortInserts = [];
                faculties.forEach(f => {
                    cohortInserts.push({ batch_id: batchId, faculty_id: f.id, master_subject_id: sub1 });
                    cohortInserts.push({ batch_id: batchId, faculty_id: f.id, master_subject_id: sub2 });
                    cohortInserts.push({ batch_id: batchId, faculty_id: f.id, master_subject_id: sub3 });
                });

                // Ignore errors for duplicates
                await supabase.from('cohort_subjects').upsert(cohortInserts, { onConflict: 'batch_id, faculty_id, master_subject_id', ignoreDuplicates: true });

                localStorage.setItem('admin_wired_dataset_v3', 'true');
                if (window.erpDialog) window.erpDialog.alert("Dataset successfully wired by Admin!");
                else alert("Dataset successfully wired by Admin!");
            } catch (err) {
                console.error(err);
            }
        };
        wireDataAsAdmin();
    }, []);
"""

# inject right after useEffect hook or inside component
# Find the component definition
target = "export default function AdminAcademicHub"
# We need to make sure useEffect is imported.
if "useEffect" not in content:
    content = content.replace('import React from "react";', 'import React, { useEffect } from "react";')
    content = content.replace('import React, { useState } from "react";', 'import React, { useState, useEffect } from "react";')

# Now inject inside the component
if "const { userSession } = useERP();" in content:
    content = content.replace("const { userSession } = useERP();", "const { userSession } = useERP();\n" + wire_script)
else:
    content = re.sub(r'(export default function AdminAcademicHub.*?\{)', r'\1\n' + wire_script, content, count=1, flags=re.DOTALL)

with open('src/ERP/components/Admin/AdminAcademicHub/AdminAcademicHub.jsx', 'w') as f:
    f.write(content)

