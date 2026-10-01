const fs = require('fs');

// 1. AdminPlacements.jsx
let file = 'Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx';
let content = fs.readFileSync(file, 'utf8');

const placementToggle = `const { error } = await supabase.from('placement_applications').update({ status: newStatus }).eq('id', appId);
        if (!error) {
            fetchApplications();
        }`;
const placementToggleNew = `const { error } = await supabase.from('placement_applications').update({ status: newStatus }).eq('id', appId);
        if (!error) {
            fetchApplications();
            // Send Notification
            const app = applications.find(a => a.id === appId);
            if (app) {
                await supabase.from('notices').insert([{
                    notice_id: \`PLC-\${Date.now()}\`,
                    title: 'Placement Update',
                    category: 'Placements',
                    target_audience: ['student'],
                    target_user_id: app.student_id,
                    priority: 'high',
                    content: \`Your placement application for \${app.placement_drives?.company_name} has been updated to: \${newStatus}\`,
                    author_name: 'Placement Cell',
                    author_id: null
                }]);
            }
        }`;
content = content.replace(placementToggle, placementToggleNew);
fs.writeFileSync(file, content);

// 2. AdminFees.jsx
file = 'Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx';
content = fs.readFileSync(file, 'utf8');

const feeConfirm = `const { error: invErr } = await supabase.from('fee_invoices').update({ status: 'Paid', payment_date: new Date().toISOString() }).eq('id', txn.invoice_id);
            if (invErr) throw invErr;`;
const feeConfirmNew = `const { error: invErr } = await supabase.from('fee_invoices').update({ status: 'Paid', payment_date: new Date().toISOString() }).eq('id', txn.invoice_id);
            if (invErr) throw invErr;
            await supabase.from('notices').insert([{
                notice_id: \`FEE-\${Date.now()}\`,
                title: 'Payment Confirmed',
                category: 'Finance',
                target_audience: ['student'],
                target_user_id: txn.student_id,
                priority: 'normal',
                content: \`Your payment has been verified. A receipt has been generated.\`,
                author_name: 'Finance Department',
                author_id: null
            }]);`;
content = content.replace(feeConfirm, feeConfirmNew);

const feeAssign = `const { error } = await supabase.from('fee_invoices').insert(invoices);
            if (error) throw error;`;
const feeAssignNew = `const { error } = await supabase.from('fee_invoices').insert(invoices);
            if (error) throw error;
            await supabase.from('notices').insert([{
                notice_id: \`FEE-A-\${Date.now()}\`,
                title: 'New Fee Assigned',
                category: 'Finance',
                target_audience: ['student'],
                target_user_id: null,
                priority: 'high',
                content: \`A new fee invoice has been generated for your batch.\`,
                author_name: 'Finance Department',
                author_id: null
            }]);`;
content = content.replace(feeAssign, feeAssignNew);
fs.writeFileSync(file, content);

// 3. MentorshipAllocations.jsx
file = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx';
content = fs.readFileSync(file, 'utf8');

const mentorAssign = `const { error } = await supabase.from('mentorship').insert({
                student_id: draggedStudent.id,
                faculty_id: destination.droppableId
            });`;
const mentorAssignNew = `const { error } = await supabase.from('mentorship').insert({
                student_id: draggedStudent.id,
                faculty_id: destination.droppableId
            });
            if (!error) {
                await supabase.from('notices').insert([{
                    notice_id: \`MNT-\${Date.now()}\`,
                    title: 'Mentor Assigned',
                    category: 'Academics',
                    target_audience: ['student'],
                    target_user_id: draggedStudent.id,
                    priority: 'normal',
                    content: \`You have been assigned to a new Faculty Mentor. Please check your mentorship portal.\`,
                    author_name: 'Academic Office',
                    author_id: null
                }]);
            }`;
content = content.replace(mentorAssign, mentorAssignNew);
fs.writeFileSync(file, content);

// 4. AdminPayroll.jsx
file = 'Frontend/ERP/components/Admin/AdminPayroll/AdminPayroll.jsx';
content = fs.readFileSync(file, 'utf8');

const payrollDisburse = `const { error } = await supabase.from('faculty_payroll').insert([payload]);
            if (error) throw error;`;
const payrollDisburseNew = `const { error } = await supabase.from('faculty_payroll').insert([payload]);
            if (error) throw error;
            await supabase.from('notices').insert([{
                notice_id: \`PAY-\${Date.now()}\`,
                title: 'Payroll Disbursed',
                category: 'Finance',
                target_audience: ['faculty'],
                target_user_id: selectedFaculty.db_id,
                priority: 'high',
                content: \`Your salary for \${currentMonth} \${currentYear} has been disbursed.\`,
                author_name: 'Finance Department',
                author_id: null
            }]);`;
content = content.replace(payrollDisburse, payrollDisburseNew);
fs.writeFileSync(file, content);

// 5. AdminAttendanceIssues.jsx
file = 'Frontend/ERP/components/Admin/AdminAttendanceIssues/AdminAttendanceIssues.jsx';
content = fs.readFileSync(file, 'utf8');

const debar = `const { error } = await supabase.from('profiles').update({ is_debarred: true, debar_reason: reason }).eq('id', student.id);
            if (error) throw error;`;
const debarNew = `const { error } = await supabase.from('profiles').update({ is_debarred: true, debar_reason: reason }).eq('id', student.id);
            if (error) throw error;
            await supabase.from('notices').insert([{
                notice_id: \`DEB-\${Date.now()}\`,
                title: 'DEBARMENT NOTICE',
                category: 'System Alert',
                target_audience: ['student'],
                target_user_id: student.id,
                priority: 'high',
                content: \`You have been debarred due to attendance shortage. Reason: \${reason}\`,
                author_name: 'Academic Controller',
                author_id: null
            }]);`;
content = content.replace(debar, debarNew);

const reinstate = `const { error } = await supabase.from('profiles').update({ is_debarred: false, debar_reason: null }).eq('id', student.id);
            if (error) throw error;`;
const reinstateNew = `const { error } = await supabase.from('profiles').update({ is_debarred: false, debar_reason: null }).eq('id', student.id);
            if (error) throw error;
            await supabase.from('notices').insert([{
                notice_id: \`REI-\${Date.now()}\`,
                title: 'Debarment Lifted',
                category: 'Academics',
                target_audience: ['student'],
                target_user_id: student.id,
                priority: 'normal',
                content: \`Your debarment has been lifted. You are now eligible to attend examinations.\`,
                author_name: 'Academic Controller',
                author_id: null
            }]);`;
content = content.replace(reinstate, reinstateNew);
fs.writeFileSync(file, content);

