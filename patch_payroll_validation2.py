import re

with open('src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx', 'r') as f:
    content = f.read()

# 1. Update handleSaveAccount
old_func_pattern = re.compile(r'const handleSaveAccount = async \(e\) => \{.*?finally \{\s*setIsSaving\(false\);\s*\}\s*\};', re.DOTALL)

new_handle_save = """const handleSaveAccount = async (e) => {
        e.preventDefault();

        const acctRegex = /^[0-9]{9,18}$/;
        if (!acctRegex.test(accountDetails.account_number)) {
            if (window.erpDialog) window.erpDialog.alert("Account Number must be between 9 and 18 digits.", "error");
            else alert("Account Number must be between 9 and 18 digits.");
            return;
        }

        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        if (!ifscRegex.test(accountDetails.ifsc_code)) {
            if (window.erpDialog) window.erpDialog.alert("IFSC Code must be valid (e.g. HDFC0001234).", "error");
            else alert("IFSC Code must be valid (e.g. HDFC0001234).");
            return;
        }

        const msg = "Are you sure you want to securely sync these payroll details?";
        const confirmed = window.erpDialog ? window.erpDialog.confirm(msg) : confirm(msg);
        if (!confirmed) return;

        setIsSaving(true);
        try {
            const { error: err1 } = await supabase.from('profiles').update({
                payment_details: accountDetails
            }).eq('id', facultyId);

            const { error: err2 } = await supabase.from('profiles').update({
                bank_name: accountDetails.bank_name,
                account_number: accountDetails.account_number,
                ifsc_code: accountDetails.ifsc_code
            }).eq('id', facultyId);

            if (err1 && err2) {
                console.error("Sync Error:", err1, err2);
                if (window.erpDialog) window.erpDialog.alert("Failed to sync account details. Database error.", "error");
                else alert("Failed to sync account details. Database error.");
            } else {
                sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(accountDetails));
                if (window.erpDialog) window.erpDialog.alert("Payroll destination synced securely.", "success");
                else alert("Payroll destination synced securely.");
                setShowAccountModal(false);
            }
        } catch (error) {
            console.error(error);
            if (window.erpDialog) window.erpDialog.alert("An unexpected error occurred.", "error");
            else alert("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };"""

content = old_func_pattern.sub(new_handle_save, content)

# 2. Account Number Input
content = re.sub(
    r'<input type="text" required value=\{accountDetails\.account_number\}.*?/>',
    r'<input type="text" required value={accountDetails.account_number} onChange={(e) => setAccountDetails({...accountDetails, account_number: e.target.value.replace(/\\D/g, "").slice(0, 18)})} placeholder="9 to 18 Digit Account Number" minLength={9} maxLength={18} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:ring-0 focus:outline-none outline-none transition font-mono placeholder:font-sans placeholder:text-gray-400 dark:placeholder:text-white/30" />',
    content
)

# 3. IFSC Code Input
content = re.sub(
    r'<input type="text" required value=\{accountDetails\.ifsc_code\}.*?/>',
    r"""<input type="text" required value={accountDetails.ifsc_code} onChange={(e) => {
                                        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                                        if (val.length > 0) val = val.substring(0, 4).replace(/[^A-Z]/g, '') + val.substring(4);
                                        if (val.length > 4) val = val.substring(0, 4) + '0' + val.substring(5);
                                        setAccountDetails({...accountDetails, ifsc_code: val});
                                    }} placeholder="HDFC0001234" maxLength={11} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:ring-0 focus:outline-none outline-none transition uppercase placeholder:normal-case placeholder:text-gray-400 dark:placeholder:text-white/30" />""",
    content
)

with open('src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx', 'w') as f:
    f.write(content)

