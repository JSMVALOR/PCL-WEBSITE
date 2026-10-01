const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

const newSave = `
    const { error: profileError } = await supabase.rpc('admin_update_master_record', {
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
    }
`;

file = file.replace(
    /const \{ error: profileError \} = await supabase\.from\('profiles'\)\.update\(profilePayload\)\.eq\('id', user\.db_id\);\s*if \(profileError\) throw profileError;\s*\/\/ Update Faculty Profile\s*if \(user\.role === 'faculty'\) \{\s*const researchArray = formData\.research\.split\(\',\('\)\.map\(s => s\.trim\(\)\)\.filter\(Boolean\);\s*const \{ error: facError \} = await supabase\.from\('faculty_profiles'\)\.upsert\(\{[\s\S]*?\}, \{ onConflict: 'id' \}\);\s*if \(facError\) throw facError;\s*\}/,
    newSave
);

// Wait, the regex might fail because of `.split(',').map(s => s.trim()).filter(Boolean);`
