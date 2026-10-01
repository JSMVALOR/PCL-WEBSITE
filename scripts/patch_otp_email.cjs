const fs = require('fs');

let template = fs.readFileSync('Frontend/ERP/lib/emailtemplate.js', 'utf8');

// 1. Add preheader parameter to buildEmailHtml
template = template.replace(
    'const buildEmailHtml = (title, content) => `\n<!DOCTYPE html>',
    'const buildEmailHtml = (title, content, preheader = "") => `\n<!DOCTYPE html>'
);

// 2. Add preheader div to body
template = template.replace(
    '<body>\n    <div class="container">',
    '<body>\n    ${preheader ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}\n    <div class="container">'
);

// 3. Update ERP_LOGIN_OTP to use preheader
template = template.replace(
    /ERP_LOGIN_OTP: \(params\) => buildEmailHtml\(\s*'ERP Login Passcode',\s*`<p>Dear User,<\/p>\s*<p>Please use the verification code below to access your ERP account\.<\/p>\s*<div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #18181b; border-radius: 8px;">\s*<span style="font-family: monospace; font-size: 32px; letter-spacing: 8px; color: #fecaca; font-weight: bold;">\$\{params\.otp\}<\/span>\s*<\/div>\s*<p style="font-size: 13px; color: #71717a;">This code will expire in 10 minutes\.<\/p>`\s*\)/,
    `ERP_LOGIN_OTP: (params) => buildEmailHtml(
        'ERP Login Passcode',
        \`<p>Dear User,</p>
        <p>Please use the verification code below to access your ERP account.</p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #18181b; border-radius: 8px;">
            <span style="font-family: monospace; font-size: 32px; letter-spacing: 8px; color: #fecaca; font-weight: bold;">\${params.otp}</span>
        </div>
        <p style="font-size: 13px; color: #71717a;">This code will expire in 10 minutes.</p>\`,
        \`Your login passcode is \${params.otp}. Use this to access your account.\`
    )`
);

// 4. Add RECOVERY_OTP right after ERP_LOGIN_OTP
if (!template.includes('RECOVERY_OTP:')) {
    template = template.replace(
        `This code will expire in 10 minutes.</p>\`,
        \`Your login passcode is \${params.otp}. Use this to access your account.\`
    ),`,
        `This code will expire in 10 minutes.</p>\`,
        \`Your login passcode is \${params.otp}. Use this to access your account.\`
    ),

    RECOVERY_OTP: (params) => buildEmailHtml(
        'Account Recovery OTP',
        \`<p>Dear User,</p>
        <p>A request was made to reset the passcode for your account. Please use the verification code below to proceed.</p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #18181b; border-radius: 8px;">
            <span style="font-family: monospace; font-size: 32px; letter-spacing: 8px; color: #fecaca; font-weight: bold;">\${params.otp}</span>
        </div>
        <p style="font-size: 13px; color: #71717a;">If you did not request this, please ignore this email or contact support.</p>\`,
        \`Your account recovery OTP is \${params.otp}.\`
    ),`
    );
}

fs.writeFileSync('Frontend/ERP/lib/emailtemplate.js', template);


// UPDATE EmailService.js
let service = fs.readFileSync('Frontend/ERP/lib/EmailService.js', 'utf8');
if (!service.includes('RECOVERY_OTP:')) {
    service = service.replace(
        'message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params) }),',
        'message_body: HTML_EMAIL_TEMPLATES.ERP_LOGIN_OTP(params) }),\n\n    RECOVERY_OTP: (params) => ({\n        subject: `Your Account Recovery OTP`,\n        message_body: HTML_EMAIL_TEMPLATES.RECOVERY_OTP(params) }),'
    );
}
fs.writeFileSync('Frontend/ERP/lib/EmailService.js', service);


// UPDATE ForgotPasswordModal.jsx
let fp = fs.readFileSync('Frontend/ERP/components/Login/ForgotPasswordModal.jsx', 'utf8');
fp = fp.replace(/await sendSystemEmail\('ERP_LOGIN_OTP'/g, "await sendSystemEmail('RECOVERY_OTP'");
fs.writeFileSync('Frontend/ERP/components/Login/ForgotPasswordModal.jsx', fp);

console.log("Email OTP updates completed");
