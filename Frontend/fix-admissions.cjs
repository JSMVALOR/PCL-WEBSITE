const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add prompts
const oldPrompt = `  const handleApprovePipeline = async (app) => {
  if (!(await window.erpDialog?.confirm(\`Are you sure you want to approve \${app.name} and provision their ERP account?\`))) return;`;

const newPrompt = `  const handleApprovePipeline = async (app) => {
  if (!(await window.erpDialog?.confirm(\`Are you sure you want to approve \${app.name} and provision their ERP account?\`))) return;

  const admissionType = await window.erpDialog?.prompt(
    \`Enter Admission Type/Wave for \${app.name} (e.g., LAWCET Phase 1, Management Quota, NRI):\`,
    "Admission Profile Configuration",
    "LAWCET Phase 1"
  );
  if (admissionType === null) return;

  const joiningDate = await window.erpDialog?.prompt(
    \`Enter Official Joining Date for \${app.name} (YYYY-MM-DD) for Attendance calculation:\`,
    "Admission Profile Configuration",
    new Date().toISOString().split('T')[0]
  );
  if (joiningDate === null) return;
`;

content = content.replace(oldPrompt, newPrompt);

// 2. Add to profiles upsert
const oldUpsert = `  const { error: profileError } = await supabase.from('profiles').upsert({ id: authData.user.id,
  erp_id: generatedId,
  full_name: app.name,
  email: app.email,
  phone: app.phone || null,
  role: 'student',
  academic_batch: app.program || 'BA LLB',
  department: 'Law',
  status: 'Active'
  });`;

const newUpsert = `  const { error: profileError } = await supabase.from('profiles').upsert({ id: authData.user.id,
  erp_id: generatedId,
  full_name: app.name,
  email: app.email,
  phone: app.phone || null,
  role: 'student',
  academic_batch: app.program || 'BA LLB',
  department: 'Law',
  status: 'Active',
  admission_type: admissionType,
  joining_date: joiningDate
  });`;

content = content.replace(oldUpsert, newUpsert);

fs.writeFileSync(file, content);
console.log('done');
