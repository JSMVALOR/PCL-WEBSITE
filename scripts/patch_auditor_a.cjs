const fs = require('fs');

// 1. AdminCampusTimings.jsx
let f1 = 'Frontend/ERP/components/Admin/AdminAcademicHub/AdminCampusTimings.jsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(
    /await supabase\.from\('campus_timings'\)\.update\(\{ is_active: !currentStatus \}\)\.eq\('id', id\);/g,
    "const { error } = await supabase.from('campus_timings').update({ is_active: !currentStatus }).eq('id', id);\n            if (error) throw error;\n            if (window.erpToast) window.erpToast.show('Day updated successfully.', 'success');"
);
c1 = c1.replace(
    /await supabase\.from\('campus_timings'\)\.update\(\{ metadata: newMeta \}\)\.eq\('id', id\);/g,
    "const { error } = await supabase.from('campus_timings').update({ metadata: newMeta }).eq('id', id);\n            if (error) throw error;\n            if (window.erpToast) window.erpToast.show('Saturday rule updated successfully.', 'success');"
);
fs.writeFileSync(f1, c1);

// 2. AdminBatchManager.jsx
let f2 = 'Frontend/ERP/components/Admin/AdminAcademicHub/AdminBatchManager.jsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(
    /if \(error\) throw error;\n            fetchBatches\(\);/g,
    "if (error) throw error;\n            fetchBatches();\n            if (window.erpToast) window.erpToast.show('Batch deleted successfully.', 'success');"
);
fs.writeFileSync(f2, c2);

// 3. AdminSystemSettings.jsx
let f3 = 'Frontend/ERP/components/Admin/AdminAcademicHub/AdminSystemSettings.jsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(
    /setSaveSuccess\(true\);\n            setTimeout\(\(\) => setSaveSuccess\(false\), 3000\);/g,
    "if (window.erpToast) window.erpToast.show('System parameters updated successfully.', 'success');"
);
fs.writeFileSync(f3, c3);

// 4. AdminAdmissions.jsx
let f4 = 'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let c4 = fs.readFileSync(f4, 'utf8');
c4 = c4.replace(/\(window\.erpDialog\?\.alert \|\| alert\)\((.*?)\);/g, 'if(window.erpToast) window.erpToast.show($1, "info");');
c4 = c4.replace(/window\.erpToast\?\.show\?\.\('Failed to reject application\.', 'error'\) \|\| /g, '');
// Pipeline success/error
c4 = c4.replace(
    /setStepStatus\('SUCCESS'\);\n                    setProvisioningLogs\(prev => \[...prev, `\\[DONE\\] Provisioning completed \$\{new Date\(\)\.toLocaleTimeString\(\)\}`\]\);/g,
    "setStepStatus('SUCCESS');\n                    setProvisioningLogs(prev => [...prev, `[DONE] Provisioning completed ${new Date().toLocaleTimeString()}`]);\n                    if(window.erpToast) window.erpToast.show('Student provisioned successfully!', 'success');"
);
c4 = c4.replace(
    /setStepStatus\('ERROR'\);\n                    setProvisioningLogs\(prev => \[...prev, `\\[ERROR\\] \$\{err\.message\}`\]\);/g,
    "setStepStatus('ERROR');\n                    setProvisioningLogs(prev => [...prev, `[ERROR] ${err.message}`]);\n                    if(window.erpToast) window.erpToast.show(`Provisioning failed: ${err.message}`, 'error');"
);
fs.writeFileSync(f4, c4);

// 5. AdminAttendanceIssues.jsx
let f5 = 'Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx';
let c5 = fs.readFileSync(f5, 'utf8');
c5 = c5.replace(
    /await supabase.from\('profiles'\).update\(\{ is_debarred: true, debar_reason: reason \}\).eq\('id', student\.id\);/g,
    "const { error } = await supabase.from('profiles').update({ is_debarred: true, debar_reason: reason }).eq('id', student.id);\n            if (error) throw error;"
);
c5 = c5.replace(
    /await supabase.from\('profiles'\).update\(\{ is_debarred: false, debar_reason: null \}\).eq\('id', student\.id\);/g,
    "const { error } = await supabase.from('profiles').update({ is_debarred: false, debar_reason: null }).eq('id', student.id);\n            if (error) throw error;"
);
// wait, the alert -> toast replacement was already done by my previous fix_dialog_alerts script?
// let's just make sure.

fs.writeFileSync(f5, c5);
