import re

with open('src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx', 'r') as f:
    content = f.read()

# 1. Update handleSaveAccount to include confirm and fallback alerts
old_handle_save = """    const handleSaveAccount = async (e) => {
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
                sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(accountDetails));
                window.erpDialog?.alert("Payroll destination synced securely.");
                setShowAccountModal(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };"""

new_handle_save = """    const handleSaveAccount = async (e) => {
        e.preventDefault();

        // Hardcode Validations
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

content = content.replace(old_handle_save, new_handle_save)

# 2. Update inputs formatting logic
# Account Number input
old_acc_input = """<input type="text" required value={accountDetails.account_number} onChange={(e) => setAccountDetails({...accountDetails, account_number: e.target.value.replace(/\D/g, '')})} placeholder="00000000000" className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:ring-0 focus:outline-none outline-none transition font-mono placeholder:font-sans placeholder:text-gray-300 dark:text-white/20" />"""
new_acc_input = """<input type="text" required value={accountDetails.account_number} onChange={(e) => setAccountDetails({...accountDetails, account_number: e.target.value.replace(/\D/g, '').slice(0, 18)})} placeholder="9 to 18 Digit Account Number" minLength={9} maxLength={18} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:ring-0 focus:outline-none outline-none transition font-mono placeholder:font-sans placeholder:text-gray-400 dark:placeholder:text-white/30" />"""
content = content.replace(old_acc_input, new_acc_input)

# IFSC input
old_ifsc_input = """<input type="text" required value={accountDetails.ifsc_code} onChange={(e) => setAccountDetails({...accountDetails, ifsc_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)})} placeholder="HDFC0001234" className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:ring-0 focus:outline-none outline-none transition uppercase placeholder:normal-case placeholder:text-gray-300 dark:text-white/20" />"""

new_ifsc_input = """<input type="text" required value={accountDetails.ifsc_code} onChange={(e) => {
                                        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                                        // Enforce formatting inline: First 4 chars must be A-Z, 5th must be 0
                                        if (val.length > 0) val = val.substring(0, 4).replace(/[^A-Z]/g, '') + val.substring(4);
                                        if (val.length > 4) val = val.substring(0, 4) + '0' + val.substring(5);
                                        setAccountDetails({...accountDetails, ifsc_code: val});
                                    }} placeholder="HDFC0001234" maxLength={11} className="w-full bg-gray-100 dark:bg-themeApp border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 focus:ring-0 focus:outline-none outline-none transition uppercase placeholder:normal-case placeholder:text-gray-400 dark:placeholder:text-white/30" />"""
content = content.replace(old_ifsc_input, new_ifsc_input)


with open('src/ERP/components/Faculty/FacultyPayroll/FacultyPayroll.jsx', 'w') as f:
    f.write(content)

