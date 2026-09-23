import { HTML_EMAIL_TEMPLATES } from './src/ERP/lib/emailtemplate.js';

const EMAIL_TEMPLATES = {
    PARENT_LOGIN_OTP: (params) => ({ subject: `Your Parent Portal Verification Code`, message_body: HTML_EMAIL_TEMPLATES.PARENT_LOGIN_OTP(params) }),
    PARENT_ABSENT_ALERT: (params) => ({ subject: `[ATTENDANCE ALERT] ${params.student_name} marked absent`, message_body: HTML_EMAIL_TEMPLATES.PARENT_ABSENT_ALERT(params) }),
    ERP_LOGIN_OTP: (params) => ({ subject: `Your ERP Login Passcode`, message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params) }),
    APPLICATION_RECEIVED: (params) => ({ subject: `Application Received - Ticket #${params.ticket_id}`, message_body: HTML_EMAIL_TEMPLATES.APPLICATION_RECEIVED(params) }),
    TICKET_REPLY: (params) => ({ subject: `Update on Ticket #${params.ticket_id} - Prudentia`, message_body: HTML_EMAIL_TEMPLATES.TICKET_REPLY(params) }),
    SUPPORT_ENQUIRY: (params) => ({ subject: `We Received Your Enquiry - Ticket #${params.ticket_id}`, message_body: HTML_EMAIL_TEMPLATES.SUPPORT_ENQUIRY(params) }),
    ONBOARDING: (params) => ({ subject: `Welcome to PCL ERP - Your Official Credentials`, message_body: HTML_EMAIL_TEMPLATES.FIRST_CREDENTIALS({ erp_id: params.erp_id, password: params.password, student_name: params.student_name, portal_link: params.portal_link }) }),
    PAYROLL_DISBURSAL: (params) => ({ subject: `Salary Disbursal - ${params.month} ${params.year}`, message_body: HTML_EMAIL_TEMPLATES.PAYROLL_DISBURSAL(params) }),
    ASSIGNMENT_PUBLISHED: (params) => ({ subject: `New Assignment Published: ${params.title}`, message_body: HTML_EMAIL_TEMPLATES.ASSIGNMENT_PUBLISHED(params) }),
    LEAVE_APPLIED: (params) => ({ subject: `Leave Application Submitted`, message_body: HTML_EMAIL_TEMPLATES.LEAVE_APPLIED(params) }),
    LEAVE_APPROVED: (params) => ({ subject: `Leave Application Approved`, message_body: HTML_EMAIL_TEMPLATES.LEAVE_APPROVED(params) }),
    LEAVE_REJECTED: (params) => ({ subject: `Leave Application Rejected`, message_body: HTML_EMAIL_TEMPLATES.LEAVE_REJECTED(params) }),
    HAPPY_BIRTHDAY: (params) => ({ subject: `Happy Birthday from Prudentia College of Law!`, message_body: HTML_EMAIL_TEMPLATES.HAPPY_BIRTHDAY(params) }),
    DEBARMENT_NOTICE: (params) => ({ subject: `CRITICAL: Attendance Debarment Notice`, message_body: HTML_EMAIL_TEMPLATES.DEBARMENT_NOTICE(params) }),
    SHORTAGE_WARNING: (params) => ({ subject: `WARNING: Attendance Shortage`, message_body: HTML_EMAIL_TEMPLATES.SHORTAGE_WARNING(params) })
};

const commonParams = {
    student_name: 'Jane Doe',
    faculty_name: 'Prof. John Smith',
    otp: '123456',
    subject: 'Constitutional Law',
    subject_name: 'Constitutional Law',
    date: 'Oct 25, 2026',
    ticket_id: 'TCK-9981',
    erp_id: 'PCL-2026-001',
    password: 'TempPassword123!',
    portal_link: 'https://prudentiacollegeoflaw2.vercel.app/login',
    month: 'October',
    year: '2026',
    payment_mode: 'NEFT Transfer',
    final_net_pay: 125000,
    title: 'Case Study Analysis',
    deadline: new Date().toISOString(),
    submission_mode: 'URL_ONLY',
    leave_type: 'Medical Leave',
    start_date: 'Oct 26, 2026',
    end_date: 'Oct 28, 2026',
    reason: 'Severe viral fever.',
    approved_by: 'Dr. Emily Carter',
    rejected_by: 'Dr. Emily Carter',
    attendance_percentage: 62,
    threshold: 75
};

async function fireAll() {
    console.log("Triggering emails to Vercel Endpoint...");
    for (const key of Object.keys(EMAIL_TEMPLATES)) {
        try {
            const { subject, message_body } = EMAIL_TEMPLATES[key](commonParams);
            
            const res = await fetch('https://prudentiacollegeoflaw2.vercel.app/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_email: 'marvelswaroop118@gmail.com',
                    subject: subject,
                    message_body: message_body
                })
            });
            
            if (res.ok) {
                console.log(`✅ Sent: ${key}`);
            } else {
                const err = await res.text();
                console.log(`❌ Failed: ${key} - ${err}`);
            }
        } catch(e) {
            console.log(`❌ Error: ${key} - ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 600));
    }
    console.log("Finished sending all test emails.");
}

fireAll();
