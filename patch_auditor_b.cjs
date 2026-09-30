const fs = require('fs');

// 1. AdminFees.jsx
let f1 = 'Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(
    /\(window\.erpDialog\?\.alert \|\| alert\)\(`✅ Payment Confirmed & Locked PDF Sent to \$\{txn\.profiles\?\.full_name\}`\);/g,
    'if(window.erpToast) window.erpToast.show(`Payment Confirmed & Locked PDF Sent to ${txn.profiles?.full_name}`, "success");'
);
c1 = c1.replace(
    /\(window\.erpDialog\?\.alert \|\| alert\)\('Bulk Marked Paid successfully\.'\);/g,
    'if(window.erpToast) window.erpToast.show("Bulk Marked Paid successfully.", "success");'
);
c1 = c1.replace(
    /\(window\.erpDialog\?\.alert \|\| alert\)\('Fee assigned to batch successfully\.'\);/g,
    'if(window.erpToast) window.erpToast.show("Fee assigned to batch successfully.", "success");'
);
c1 = c1.replace(
    /const handleRemoveExpense = async \(id\) => \{/g,
    'const handleRemoveExpense = async (id) => {\n        if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm("Are you sure you want to delete this expense?", r)))) return;'
);
c1 = c1.replace(
    /const \{ error \} = await supabase.from\('recurring_expenses'\).delete\(\).eq\('id', id\);\n\s*if \(error\) throw error;\n\s*fetchOverview\(\);/g,
    "const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);\n            if (error) throw error;\n            fetchOverview();\n            if(window.erpToast) window.erpToast.show('Expense deleted successfully.', 'success');"
);
c1 = c1.replace(
    /const \{ error \} = await supabase.from\('recurring_expenses'\).insert\(\{/g,
    "const { error } = await supabase.from('recurring_expenses').insert({"
);
c1 = c1.replace(
    /if \(error\) throw error;\n\s*setNewExpenseName\(''\);\n\s*setNewExpenseAmount\(''\);\n\s*fetchOverview\(\);/g,
    "if (error) throw error;\n            setNewExpenseName('');\n            setNewExpenseAmount('');\n            fetchOverview();\n            if(window.erpToast) window.erpToast.show('Expense added successfully.', 'success');"
);
fs.writeFileSync(f1, c1);

// 2. AdminFacultyAttendance.jsx
let f2 = 'Frontend/ERP/components/Admin/AdminFacultyAttendance/AdminFacultyAttendance.jsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(
    /fetchAttendanceData\(\);\n\s*setMarkingModal\(null\);\n\s*setMarkingNotes\(''\);/g,
    "fetchAttendanceData();\n            setMarkingModal(null);\n            setMarkingNotes('');\n            if(window.erpToast) window.erpToast.show('Attendance status updated successfully.', 'success');"
);
fs.writeFileSync(f2, c2);

// 3. AdminFacultyDirectory.jsx
let f3 = 'Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyDirectory.jsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(
    /setProvisionLogs\(prev => \[\.\.\.prev, `\\[DONE\\] Provisioning completed \$\{new Date\(\)\.toLocaleTimeString\(\)\}`\]\);/g,
    "setProvisionLogs(prev => [...prev, `[DONE] Provisioning completed ${new Date().toLocaleTimeString()}`]);\n            if(window.erpToast) window.erpToast.show('Faculty account provisioned successfully.', 'success');"
);
c3 = c3.replace(
    /setProvisionLogs\(prev => \[\.\.\.prev, `\\[ERROR\\] \$\{error\.message\}`\]\);/g,
    "setProvisionLogs(prev => [...prev, `[ERROR] ${error.message}`]);\n            if(window.erpToast) window.erpToast.show(error.message, 'error');"
);
c3 = c3.replace(
    /fetchDirectory\(\);\n\s*\} catch \(err\)/g,
    "fetchDirectory();\n            if(window.erpToast) window.erpToast.show('Visibility updated successfully.', 'success');\n        } catch (err)"
);
fs.writeFileSync(f3, c3);

// 4. AdminFacultyEditorModal.jsx
let f4 = 'Frontend/ERP/components/Admin/AdminFacultyDirectory/AdminFacultyEditorModal.jsx';
let c4 = fs.readFileSync(f4, 'utf8');
c4 = c4.replace(
    /onSave\(\);\n\s*onClose\(\);/g,
    "if(window.erpToast) window.erpToast.show('Faculty profile updated successfully.', 'success');\n            onSave();\n            onClose();"
);
fs.writeFileSync(f4, c4);

// 5. AdminHelpdesk.jsx
let f5 = 'Frontend/ERP/components/Admin/AdminHelpdesk/AdminHelpdesk.jsx';
let c5 = fs.readFileSync(f5, 'utf8');
c5 = c5.replace(
    /setSubmittingReply\(null\);\n\s*if \(!isClosing\) setText\(''\);\n\s*fetchTickets\(\);\n\s*\} catch \(error\)/g,
    "setSubmittingReply(null);\n            if (!isClosing) setText('');\n            fetchTickets();\n            if(window.erpToast) window.erpToast.show(isClosing ? 'Ticket resolved successfully.' : 'Reply sent successfully.', 'success');\n        } catch (error)"
);
fs.writeFileSync(f5, c5);

// 6. LeaveReview.jsx
let f6 = 'Frontend/ERP/components/Admin/LeaveManagement/LeaveReview.jsx';
let c6 = fs.readFileSync(f6, 'utf8');
c6 = c6.replace(
    /remarks = await window\.erpDialog\?\.prompt\("Please enter a reason for rejecting this leave:", "Reject Leave"\) \|\| window\.prompt\("Reason for rejection:"\);/g,
    "if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm('Are you sure you want to reject this leave request?', r)))) { setIsProcessing(false); return; }\n            remarks = await window.erpDialog?.prompt('Please enter a reason for rejecting this leave:', 'Reject Leave') || '';"
);
fs.writeFileSync(f6, c6);

// 7. ReplacementEngine.jsx
let f7 = 'Frontend/ERP/components/Admin/LeaveManagement/ReplacementEngine.jsx';
let c7 = fs.readFileSync(f7, 'utf8');
c7 = c7.replace(
    /window\.erpDialog\?\.alert\(\s*`✅ Replacement Assigned Successfully!\\n\\nLeave ID: \$\{req\.id\}\\nOriginal Faculty: \$\{req\.profiles\?.full_name\}\\nReplacement: \$\{faculty\.profiles\?.full_name\}\\nDate: \$\{new Date\(req\.start_date\)\.toLocaleDateString\(\)\}`\s*\);/g,
    "if(window.erpToast) window.erpToast.show('Replacement faculty assigned successfully.', 'success');"
);
fs.writeFileSync(f7, c7);

