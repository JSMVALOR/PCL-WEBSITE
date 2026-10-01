const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

const regex = /const \{ error: profileError \} = await supabase\.from\('profiles'\)\.update\(profilePayload\)\.eq\('id', user\.db_id\);[\s\S]*?if \(facError\) throw facError;\s*\}/;

const newStr = `const { error: profileError } = await supabase.rpc('admin_update_master_record', {
      target_user_id: user.db_id,
      payload: profilePayload
    });
    if (profileError) throw profileError;

    // Update Faculty Profile
    if (user.role === 'faculty') {
      const researchArray = formData.research.split(',').map(s => s.trim()).filter(Boolean);
      const facPayload = {
        designation: formData.designation,
        specialisation: formData.specialisation,
        image_url: finalImageUrl,
        bio: formData.bio,
        research: researchArray,
        is_public: formData.is_public,
        phone: formData.phone
      };
      
      const { error: facError } = await supabase.rpc('admin_update_faculty_record', {
        target_user_id: user.db_id,
        payload: facPayload
      });
      if (facError) throw facError;
    }`;

file = file.replace(regex, newStr);
fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);
