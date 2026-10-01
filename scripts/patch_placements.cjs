const fs = require('fs');

let file = 'Frontend/ERP/components/Admin/AdminPlacements/AdminPlacements.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fetch email
content = content.replace(
    "profiles!placement_applications_student_id_fkey(full_name, erp_id)",
    "profiles!placement_applications_student_id_fkey(full_name, erp_id, email)"
);

// 2. Add EmailService import
if (!content.includes('sendSystemEmail')) {
    content = content.replace(
        "import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';",
        "import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';\nimport { sendSystemEmail } from '../../../lib/EmailService';"
    );
}

// 3. Email hook in handleUpdateApplicationStatus
const oldStatus = `            await fetchApplications();`;
const newStatus = `            const app = applications.find(a => a.id === appId);
            if (app && app.profiles?.email) {
                try {
                    await sendSystemEmail('PLACEMENT_STATUS_UPDATE', {
                        to_email: app.profiles.email,
                        student_name: app.profiles.full_name,
                        company: app.placement_drives?.firm_name || 'Placement Cell',
                        role: app.placement_drives?.role_type || 'Role',
                        status: newStatus
                    });
                } catch(e) {}
            }
            await fetchApplications();
            if (window.erpToast) window.erpToast.show(\`Application marked as \${newStatus}\`, "success");`;

content = content.replace(oldStatus, newStatus);

// 4. ErpDialog replacements
content = content.replace(/window\.erpDialog\?\.alert\("Placement Drive created successfully!"\);/g, "if(window.erpToast) window.erpToast.show('Placement Drive created successfully!', 'success');");
content = content.replace(/window\.erpDialog\?\.alert\("Failed to create drive\."\);/g, "if(window.erpToast) window.erpToast.show('Failed to create drive.', 'error');");
content = content.replace(/window\.erpDialog\?\.alert\("Failed to update status\."\);/g, "if(window.erpToast) window.erpToast.show('Failed to update status.', 'error');");

fs.writeFileSync(file, content);
