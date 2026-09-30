const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/LeaveManagement/LeaveReview.jsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { sendSystemEmail } from '../../../lib/EmailService';`;
if(!content.includes('sendSystemEmail')) {
    content = content.replace(`import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';`, `import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';\n${importStatement}`);
}

const oldHandleAction = ` const handleAction = async (actionType) => {
 setIsProcessing(true);
 try {
 let updatePayload = {};

 if (actionType === 'Reject') {
 const remarks = window.prompt("Reason for rejection:");
 if (!remarks) return; // cancelled
 updatePayload = { status: 'Rejected', admin_remarks: remarks };
 } 
 else if (actionType === 'Approve') {
 updatePayload = { status: 'Approved', replacement_status: 'Not Required' };
 }
 else if (actionType === 'ApproveAndReplace') {
 updatePayload = { status: 'Approved', replacement_status: 'Pending' };
 }

 const { error } = await supabase
 .from('faculty_leaves')
 .update(updatePayload)
 .eq('id', request.id);

 if (error) throw error;`;

const newHandleAction = ` const handleAction = async (actionType) => {
 setIsProcessing(true);
 try {
 let updatePayload = {};
 let remarks = "";

 if (actionType === 'Reject') {
 remarks = await window.erpDialog?.prompt("Please enter a reason for rejecting this leave:", "Reject Leave") || window.prompt("Reason for rejection:");
 if (!remarks) { setIsProcessing(false); return; } // cancelled
 updatePayload = { status: 'Rejected', admin_remarks: remarks };
 } 
 else if (actionType === 'Approve') {
 updatePayload = { status: 'Approved', replacement_status: 'Not Required' };
 }
 else if (actionType === 'ApproveAndReplace') {
 updatePayload = { status: 'Approved', replacement_status: 'Pending' };
 }

 const { error } = await supabase
 .from('faculty_leaves')
 .update(updatePayload)
 .eq('id', request.id);

 if (error) throw error;
 
 // Send Email
 try {
    if (actionType === 'Reject') {
        await sendSystemEmail('LEAVE_REJECTED', {
            to_email: request.faculty?.email || 'admin@prudentia.edu',
            student_name: request.faculty?.full_name || request.faculty_id,
            leave_type: request.leave_type,
            start_date: request.start_date,
            end_date: request.end_date,
            reason: remarks
        });
    } else {
        await sendSystemEmail('LEAVE_APPROVED', {
            to_email: request.faculty?.email || 'admin@prudentia.edu',
            student_name: request.faculty?.full_name || request.faculty_id,
            leave_type: request.leave_type,
            start_date: request.start_date,
            end_date: request.end_date
        });
    }
 } catch (emailErr) {
    console.warn("Email dispatch failed:", emailErr);
 }`;

content = content.replace(oldHandleAction, newHandleAction);
fs.writeFileSync(file, content);
