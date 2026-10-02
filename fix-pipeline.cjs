const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetUpsert = ` const { error: profileError } = await supabase.from('profiles').upsert({ id: authData.user.id,
 erp_id: generatedId,
 full_name: app.name,
 email: app.email,
 role: 'student',
 academic_batch: app.program || 'BA LLB',
 department: 'Law',
 status: 'Active'
 });`;

const newUpsert = ` const { error: profileError } = await supabase.from('profiles').upsert({ id: authData.user.id,
 erp_id: generatedId,
 full_name: app.name,
 email: app.email,
 role: 'student',
 academic_batch: app.program || 'BA LLB',
 department: 'Law',
 status: 'Active',
 joining_date: new Date().toISOString(),
 application_date: app.created_at,
 application_number: app.id,
 admission_type: app.admission_type || 'Management Quota'
 });`;

content = content.replace(targetUpsert, newUpsert);

fs.writeFileSync(file, content);
console.log('done');
