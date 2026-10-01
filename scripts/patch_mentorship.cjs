const fs = require('fs');

let fileAdmin = 'Frontend/ERP/components/Admin/AdminMentorship/AdminMentorship.jsx';
let contentAdmin = fs.readFileSync(fileAdmin, 'utf8');
const oldTabs = "const tabs = [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' }, { id: 'allocations', label: 'Allocations', icon: 'fa-users' }, { id: 'reports', label: 'Reports', icon: 'fa-file-lines' }];";
const newTabs = "const tabs = [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' }, { id: 'allocations', label: 'Allocations', icon: 'fa-users' }, { id: 'transfers', label: 'Transfers', icon: 'fa-right-left' }, { id: 'reports', label: 'Reports', icon: 'fa-file-lines' }, { id: 'logs', label: 'Audit Logs', icon: 'fa-clipboard-list' }];";
contentAdmin = contentAdmin.replace(oldTabs, newTabs);
fs.writeFileSync(fileAdmin, contentAdmin);

let fileDash = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipDashboard.jsx';
let contentDash = fs.readFileSync(fileDash, 'utf8');
// Fix total faculty query
contentDash = contentDash.replace(
    "const totalFaculty = Object.keys(workloads).length;",
    "const totalFacultyRes = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'faculty');\n            const totalFaculty = totalFacultyRes.count || Object.keys(workloads).length;"
);
fs.writeFileSync(fileDash, contentDash);

let fileAlloc = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx';
let contentAlloc = fs.readFileSync(fileAlloc, 'utf8');
const oldCsv = `// For this demo, we'll just log success since mapping string IDs requires complex joins.
            // In production, we'd query IDs matching these reg numbers and bulk upsert.
            await logAction(\`Bulk Imported \${rows.length} mentor assignments via CSV\`);
            if (window.erpToast) window.erpToast.show(\`Successfully imported \${rows.length} assignments from CSV.\`, "success");`;

const newCsv = `// Actually sync to Supabase
            const { data: students } = await supabase.from('profiles').select('id, erp_id').eq('role', 'student');
            const { data: faculty } = await supabase.from('profiles').select('id, erp_id').eq('role', 'faculty');
            
            const inserts = rows.map(row => {
                const s = students?.find(st => st.erp_id === row.StudentRegNo);
                const f = faculty?.find(fa => fa.erp_id === row.FacultyEmployeeID);
                if (s && f) return { student_id: s.id, faculty_id: f.id };
                return null;
            }).filter(Boolean);
            
            if (inserts.length > 0) {
                await supabase.from('mentorship').upsert(inserts, { onConflict: 'student_id' });
                await logAction(\`Bulk Imported \${inserts.length} mentor assignments via CSV\`);
                if (window.erpToast) window.erpToast.show(\`Successfully imported \${inserts.length} assignments from CSV.\`, "success");
            } else {
                if (window.erpToast) window.erpToast.show("No matching student/faculty IDs found in CSV.", "error");
            }`;
contentAlloc = contentAlloc.replace(oldCsv, newCsv);

// Fix erpDialog for drops
contentAlloc = contentAlloc.replace(/window\.erpDialog\?\.alert\(/g, "if(window.erpToast) window.erpToast.show(");
contentAlloc = contentAlloc.replace(/, "success"\)/g, ", 'success')");

fs.writeFileSync(fileAlloc, contentAlloc);
