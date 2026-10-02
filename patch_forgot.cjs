const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Login/ForgotPasswordModal.jsx', 'utf8');

const idSubmitOld = `    let emailToLogin = cleanCredential;
    
    if (!cleanCredential.includes('@')) {
      if (cleanCredential === 'admin' || cleanCredential === 'principal' || cleanCredential === 'adm0001') {
        emailToLogin = 'principal@prudentiacollegeoflaw.com';
      } else if (cleanCredential === 'fac0000') {
        emailToLogin = 'fac0000@pcl.edu';
      } else {
        emailToLogin = \`\${cleanCredential}_v2@jsm.edu\`;
      }
    }
    
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    expectedOtpRef.current = generated;
    
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', emailToLogin).maybeSingle();
    
    if (profile) {
      setUserId(profile.id);
    }
    
    setEmail(emailToLogin);`;

const idSubmitNew = `    let emailToLogin = cleanCredential;
    
    if (!cleanCredential.includes('@')) {
      const { data: lookedUpEmail } = await supabase.rpc('get_email_by_erp_id', { target_erp_id: cleanCredential });
      if (lookedUpEmail) {
        emailToLogin = lookedUpEmail;
      } else {
        if (cleanCredential === 'admin' || cleanCredential === 'principal' || cleanCredential === 'adm0001') {
          emailToLogin = 'principal@prudentiacollegeoflaw.com';
        } else if (cleanCredential === 'fac0000') {
          emailToLogin = 'fac0000@pcl.edu';
        }
      }
    }
    
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', emailToLogin).maybeSingle();
    
    if (!profile) {
      throw new Error("Invalid User ID. Account does not exist.");
    }
    setUserId(profile.id);
    setEmail(emailToLogin);
    
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    expectedOtpRef.current = generated;`;

file = file.replace(idSubmitOld, idSubmitNew);

// Remove OTP bypass
file = file.replace(`if (code === expectedOtpRef.current || code === '1234') { // 1234 for testing fallback`, `if (code === expectedOtpRef.current) {`);

fs.writeFileSync('Frontend/ERP/components/Login/ForgotPasswordModal.jsx', file);
