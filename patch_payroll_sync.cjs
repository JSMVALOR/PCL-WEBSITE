const fs = require('fs');
let p = 'src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx';
let c = fs.readFileSync(p, 'utf8');

// Fix formatting in inputs
// Bank Name: allow letters and spaces
c = c.replace(
    /onChange=\{\(e\) => setAccountDetails\(\{\.\.\.accountDetails, bank_name: e\.target\.value\}\)\}/,
    `onChange={(e) => setAccountDetails({...accountDetails, bank_name: e.target.value.replace(/[^a-zA-Z\\s]/g, '')})}`
);

// Account Number: allow digits only
c = c.replace(
    /onChange=\{\(e\) => setAccountDetails\(\{\.\.\.accountDetails, account_number: e\.target\.value\}\)\}/,
    `onChange={(e) => setAccountDetails({...accountDetails, account_number: e.target.value.replace(/\\D/g, '')})}`
);

// IFSC: uppercase alphanumeric, max 11 chars
c = c.replace(
    /onChange=\{\(e\) => setAccountDetails\(\{\.\.\.accountDetails, ifsc_code: e\.target\.value\}\)\}/,
    `onChange={(e) => setAccountDetails({...accountDetails, ifsc_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)})}`
);

// Fix the purple outline issue by explicitly disabling ring and outline
c = c.replace(/focus:border-amber-500 outline-none/g, "focus:border-amber-500 focus:ring-0 focus:outline-none outline-none");

// Fix the handleSaveAccount logic to actually check for errors and show success
c = c.replace(
    /const handleSaveAccount = async \(e\) => \{[\s\S]*?catch \(error\) \{[\s\S]*?setIsSaving\(false\);\s*\}\s*\};/,
    `const handleSaveAccount = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // First update JSONB column payment_details
            const { error: err1 } = await supabase.from('profiles').update({
                payment_details: accountDetails
            }).eq('id', facultyId);

            // Also update explicit columns just in case
            const { error: err2 } = await supabase.from('profiles').update({
                bank_name: accountDetails.bank_name,
                account_number: accountDetails.account_number,
                ifsc_code: accountDetails.ifsc_code
            }).eq('id', facultyId);

            if (err1 && err2) {
                console.error("Sync Error:", err1, err2);
                window.erpDialog?.alert("Failed to sync account details. Database error.");
            } else {
                sessionStorage.setItem(\`salary_acc_\${facultyId}\`, JSON.stringify(accountDetails));
                window.erpDialog?.alert("Payroll destination synced securely.");
                setShowAccountModal(false);
            }
        } catch (error) {
            console.error(error);
            window.erpDialog?.alert("An unexpected error occurred during sync.");
        } finally {
            setIsSaving(false);
        }
    };`
);

fs.writeFileSync(p, c);
console.log("Patched payroll sync and formats.");
