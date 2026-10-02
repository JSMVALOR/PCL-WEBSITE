const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetMapped = ` const mapped = {
 db_id: p.id,
 id: p.erp_id,
 name: p.full_name,
 batch: p.academic_batch,
 section: p.section,
 department: p.department,
 email: p.email,
 avatar_url: p.profile_picture_url,
 role: p.role,
 status: p.status || 'Active',
 questionnaire_data: p.questionnaire_data
 };`;

const newMapped = ` const mapped = {
 db_id: p.id,
 id: p.erp_id,
 name: p.full_name,
 batch: p.academic_batch,
 section: p.section,
 department: p.department,
 email: p.email,
 avatar_url: p.profile_picture_url,
 role: p.role,
 status: p.status || 'Active',
 questionnaire_data: p.questionnaire_data,
 application_number: p.application_number,
 admission_type: p.admission_type,
 application_date: p.application_date,
 joining_date: p.joining_date
 };`;

if(content.includes(targetMapped)) {
    content = content.replace(targetMapped, newMapped);
    fs.writeFileSync(file, content);
    console.log('done');
} else {
    console.log('not found');
}
