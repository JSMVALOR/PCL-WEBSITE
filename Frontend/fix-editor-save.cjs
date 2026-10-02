const fs = require('fs');
const file = 'ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldUpdate = ` const { error: profileError } = await supabase
 .from('profiles')
 .update({
 full_name: formData.name,
 phone: formData.phone || null,
 ...(formData.role === 'student' ? { academic_batch: formData.assignment } : { department: formData.assignment })
 })
 .eq('id', user.id);`;

const newUpdate = ` const { error: profileError } = await supabase
 .from('profiles')
 .update({
 full_name: formData.name,
 phone: formData.phone || null,
 joining_date: formData.joining_date || null,
 admission_type: formData.admission_type || null,
 ...(formData.role === 'student' ? { academic_batch: formData.assignment } : { department: formData.assignment })
 })
 .eq('id', user.id);`;

content = content.replace(oldUpdate, newUpdate);

fs.writeFileSync(file, content);
console.log('done');
