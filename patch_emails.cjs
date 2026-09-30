const fs = require('fs');

const file = 'Frontend/ERP/lib/emailtemplate.js';
let content = fs.readFileSync(file, 'utf8');

const newTemplates = `
    PLACEMENT_STATUS_UPDATE: (params) => buildEmailHtml(
        'Placement Drive Update',
        \`<p>Dear \${params.student_name},</p>
        <p>Your application status for <strong>\${params.company_name}</strong> has been updated to: <span style="font-weight: bold; color: #059669;">\${params.status}</span>.</p>
        <p>Please log in to the Placements portal for further instructions and next steps.</p>\`
    ),

    MENTOR_ASSIGNED: (params) => buildEmailHtml(
        'Faculty Mentor Assigned',
        \`<p>Dear \${params.student_name},</p>
        <p>You have been assigned to a new Faculty Mentor: <strong>\${params.mentor_name}</strong>.</p>
        <p>Your mentor will guide you through your academic and clinical journey at Prudentia College of Law. Please log in to your ERP dashboard to view your mentor's contact details and schedule a meeting.</p>\`
    ),

    FEE_PAYMENT_RECEIPT: (params) => buildEmailHtml(
        'Fee Payment Confirmed',
        \`<p>Dear \${params.student_name},</p>
        <p>We have successfully received your payment of <strong>₹ \${params.amount}</strong> for <strong>\${params.fee_type}</strong>.</p>
        <p>Your digital receipt is attached to this email and is also available in your ERP Finance Hub.</p>\`
    ),

    CLINIC_ASSIGNMENT: (params) => buildEmailHtml(
        'Clinical Program Assignment',
        \`<p>Dear \${params.student_name},</p>
        <p>You have been assigned to the following clinical program: <strong>\${params.clinic_name}</strong>.</p>
        <div class="data-box">
            <div class="data-row"><span class="data-label">Role</span><span class="data-value">\${params.role}</span></div>
            <div class="data-row"><span class="data-label">Supervisor</span><span class="data-value">\${params.supervisor_name}</span></div>
        </div>
        <p>Log in to the Clinics Hub to view your case files and schedules.</p>\`
    )
};`;

if (!content.includes('PLACEMENT_STATUS_UPDATE')) {
    content = content.replace(/};?\s*$/, newTemplates);
    fs.writeFileSync(file, content);
    console.log("Injected missing email templates.");
}
