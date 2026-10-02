const fs = require('fs');
const file = 'ERP/components/Admin/UserManagement/UserProvisioningHub.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state for joining date
content = content.replace(
` const [newUserPhone, setNewUserPhone] = useState("");
 const [assignment, setAssignment] = useState("");`,
` const [newUserPhone, setNewUserPhone] = useState("");
 const [newUserJoiningDate, setNewUserJoiningDate] = useState(new Date().toISOString().split('T')[0]);
 const [newUserAdmissionType, setNewUserAdmissionType] = useState("Regular");
 const [assignment, setAssignment] = useState("");`
);

// 2. Add to bulkRows
content = content.replace(
  `const [bulkRows, setBulkRows] = useState([{ name: '', batch: '', email: '', phone: '' }]);`,
  `const [bulkRows, setBulkRows] = useState([{ name: '', batch: '', email: '', phone: '', joinDate: new Date().toISOString().split('T')[0], admType: 'Regular' }]);`
);

content = content.replace(
  `newRows.push({ name: '', batch: '', email: '', phone: '' });`,
  `newRows.push({ name: '', batch: '', email: '', phone: '', joinDate: new Date().toISOString().split('T')[0], admType: 'Regular' });`
);
content = content.replace( // replace globally
  /newRows\.push\(\{ name: '', batch: '', email: '', phone: '' \}\);/g,
  `newRows.push({ name: '', batch: '', email: '', phone: '', joinDate: new Date().toISOString().split('T')[0], admType: 'Regular' });`
);

content = content.replace(
  /const cols = \['name', 'batch', 'email', 'phone'\];/g,
  `const cols = ['name', 'batch', 'email', 'phone', 'joinDate', 'admType'];`
);

// 3. Update provisionUser signature
content = content.replace(
  `const provisionUser = async (name, email, phone, role, assign, currentNextNum, sendWa) => {`,
  `const provisionUser = async (name, email, phone, role, assign, currentNextNum, sendWa, joinDate, admType) => {`
);

// 4. Update profilePayload
content = content.replace(
  `  phone: phone || null,
  ...(role === 'student' ? { academic_batch: assign } : { department: assign })
  };`,
  `  phone: phone || null,
  joining_date: joinDate || new Date().toISOString().split('T')[0],
  admission_type: admType || 'Regular',
  ...(role === 'student' ? { academic_batch: assign } : { department: assign })
  };`
);

// 5. Update provisionUser calls
content = content.replace(
  `const result = await provisionUser(newUserName, newUserEmail, newUserPhone, newUserRole, assignment, null, enableWhatsApp);`,
  `const result = await provisionUser(newUserName, newUserEmail, newUserPhone, newUserRole, assignment, null, enableWhatsApp, newUserJoiningDate, newUserAdmissionType);`
);

content = content.replace(
  `const result = await provisionUser(name, email, validRows[i].phone, newUserRole, assignTarget, currentNextNum, enableWhatsApp);`,
  `const result = await provisionUser(name, email, validRows[i].phone, newUserRole, assignTarget, currentNextNum, enableWhatsApp, validRows[i].joinDate, validRows[i].admType);`
);

fs.writeFileSync(file, content);
console.log('done');
