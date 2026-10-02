const fs = require('fs');
const file = 'ERP/components/Admin/UserManagement/UserProvisioningHub.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. replace full_name block
content = content.replace(
`  full_name: name,
  status: 'Active',
  ...(role === 'student' ? { academic_batch: assign } : { department: assign })`,
`  full_name: name,
  status: 'Active',
  phone: phone || null,
  ...(role === 'student' ? { academic_batch: assign } : { department: assign })`
);

// 2. replace return payload
content = content.replace(
`  return { profilePayload, emailSent, generatedId, nextNum: nextNum + 1, password: generatedPassword };`,
`  let waSent = false;
  if (phone) {
      try {
          const waMessage = \`Welcome to Prudentia College of Law!\\n\\nYour ERP Credentials have been generated:\\n*ID:* \${generatedId}\\n*Password:* \${generatedPassword}\\n\\nPlease login at the portal and change your password immediately.\`;
          await sendSystemWhatsApp(phone, waMessage);
          waSent = true;
      } catch (err) {
          console.error("WA send failed", err);
      }
  }

  return { profilePayload, emailSent, waSent, generatedId, nextNum: nextNum + 1, password: generatedPassword };`
);

// 3. update provisionUser call for single
content = content.replace(
`  const result = await provisionUser(newUserName, newUserEmail, newUserRole, assignment, null);`,
`  const result = await provisionUser(newUserName, newUserEmail, newUserPhone, newUserRole, assignment, null);`
);

// 4. update logs for wa
content = content.replace(
`  setProvisionLogs(prev => [...prev, \`[EMAIL] Credentials notice sent.\`]);
  setStats(s => ({ ...s, mailSent: s.mailSent + 1, credentialsSent: s.credentialsSent + 1 }));
  } else {
  setProvisionLogs(prev => [...prev, \`[WARNING] Failed to send email.\`]);
  }`,
`  setProvisionLogs(prev => [...prev, \`[EMAIL] Credentials notice sent.\`]);
  setStats(s => ({ ...s, mailSent: s.mailSent + 1, credentialsSent: s.credentialsSent + 1 }));
  } else {
  setProvisionLogs(prev => [...prev, \`[WARNING] Failed to send email.\`]);
  }
  if (result.waSent) {
      setProvisionLogs(prev => [...prev, \`[WHATSAPP] Credentials sent via WhatsApp.\`]);
  }`
);

// 5. update provisionUser call for bulk
content = content.replace(
`  const result = await provisionUser(name, email, newUserRole, assignTarget, currentNextNum);`,
`  const result = await provisionUser(name, email, validRows[i].phone, newUserRole, assignTarget, currentNextNum);`
);

fs.writeFileSync(file, content);
console.log('done');
