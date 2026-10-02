const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', 'utf8');

const oldCode = ` let payload = { profile_picture_url: photoUrl };
 if (provisionedUser.role === 'student') {
 payload.parent_email = extField1 || null;
 payload.parent_name = extField2 || null;
 payload.parent_phone = extField3 || null;
 } else {
 payload.phone = extField1 || null;
 payload.department = extField2 || null;
 payload.faculty_type = extField3 || null;
    payload.is_public = isPublic;
 }

 const { error } = await supabase.from('profiles').update(payload).eq('id', provisionedUser.id);
 if (error) throw error;`;

const newCode = ` let payload = { profile_picture_url: photoUrl };
 if (provisionedUser.role === 'student') {
 payload.parent_email = extField1 || null;
 payload.parent_name = extField2 || null;
 payload.parent_phone = extField3 || null;
 } else {
 payload.phone = extField1 || null;
 payload.department = extField2 || null;
 payload.faculty_type = extField3 || null;
 }

 const { error } = await supabase.from('profiles').update(payload).eq('id', provisionedUser.id);
 if (error) throw error;
 
 if (provisionedUser.role !== 'student') {
   const { error: facError } = await supabase.from('faculty_profiles')
     .update({ is_public: isPublic, phone: extField1 || null })
     .eq('id', provisionedUser.id);
   if (facError && facError.code !== 'PGRST116') console.warn("Failed to update faculty_profiles", facError);
 }`;

file = file.replace(oldCode, newCode);
fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', file);
