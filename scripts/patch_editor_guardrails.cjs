const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

const validationCode = `
    const newErpId = formData.erp_id?.trim();
    if (user.role === 'faculty' && !/^FAC-\\d+$/.test(newErpId)) {
        if (window.erpToast) window.erpToast.show("Faculty ERP ID must follow the format 'FAC-XXXX' (e.g. FAC-0010).", "error");
        setIsSaving(false);
        return;
    }
    if (user.role === 'student' && !/^\\d{2}[A-Z]+\\d+$/.test(newErpId)) {
        if (window.erpToast) window.erpToast.show("Student ERP ID must follow the format 'YYCOURSENNNN' (e.g. 26BAL0004).", "error");
        setIsSaving(false);
        return;
    }
    
    // Uniqueness check
    if (newErpId !== user.erp_id) {
        const { data: existing } = await supabase.from('profiles').select('id').eq('erp_id', newErpId).neq('id', user.db_id).maybeSingle();
        if (existing) {
            if (window.erpToast) window.erpToast.show(\`The ERP ID \${newErpId} is already in use by another account!\`, "error");
            setIsSaving(false);
            return;
        }
    }
    
    let finalImageUrl = formData.image_url;
`;

file = file.replace(
    /let finalImageUrl = formData\.image_url;/,
    validationCode
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);
