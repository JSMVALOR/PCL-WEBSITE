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

// 6. Fix HTML layout for single phone input
content = content.replace(
`  </div>
  <div className="flex flex-col gap-2">
  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Institution Email</label>
  <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="e.g. john@pcl.edu" required={provisionMode === 'single'} />
  </div>
  </div>
  ) : (`,
`  </div>
  <div className="flex flex-col gap-2">
  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Institution Email</label>
  <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="e.g. john@pcl.edu" required={provisionMode === 'single'} />
  </div>
  <div className="flex flex-col gap-2 md:col-span-2">
  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">WhatsApp Number (Optional)</label>
  <input type="text" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="+91..." />
  </div>
  </div>
  ) : (`
);

// 7. Fix bulk layout
content = content.replace(
`  <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-widest text-themeTextSec px-2">
  <div className="col-span-4">Full Name</div>
  <div className="col-span-3">Batch/Dept</div>
  <div className="col-span-4">Email</div>
  <div className="col-span-1"></div>
  </div>
  {bulkRows.map((row, idx) => (
  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
  <input type="text" value={row.name} onChange={(e) => updateBulkRow(idx, 'name', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 0)} placeholder="Name" className="col-span-4 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.batch} onChange={(e) => updateBulkRow(idx, 'batch', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 1)} placeholder="Default" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" title="Leave blank to use the dropdown assignment" />
  <input type="email" value={row.email} onChange={(e) => updateBulkRow(idx, 'email', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 2)} placeholder="Email" className="col-span-4 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <button type="button" onClick={() => removeBulkRow(idx)} className="col-span-1 text-themeTextSec hover:text-rose-500 transition text-sm flex justify-center"><i className="fa-solid fa-xmark"></i></button>
  </div>`,
`  <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-widest text-themeTextSec px-2">
  <div className="col-span-3">Full Name</div>
  <div className="col-span-3">Batch/Dept</div>
  <div className="col-span-3">Email</div>
  <div className="col-span-2">WhatsApp</div>
  <div className="col-span-1"></div>
  </div>
  {bulkRows.map((row, idx) => (
  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
  <input type="text" value={row.name} onChange={(e) => updateBulkRow(idx, 'name', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 0)} placeholder="Name" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.batch} onChange={(e) => updateBulkRow(idx, 'batch', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 1)} placeholder="Default" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" title="Leave blank to use the dropdown assignment" />
  <input type="email" value={row.email} onChange={(e) => updateBulkRow(idx, 'email', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 2)} placeholder="Email" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.phone} onChange={(e) => updateBulkRow(idx, 'phone', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 3)} placeholder="+91..." className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <button type="button" onClick={() => removeBulkRow(idx)} className="col-span-1 text-themeTextSec hover:text-rose-500 transition text-sm flex justify-center"><i className="fa-solid fa-xmark"></i></button>
  </div>`
);

fs.writeFileSync(file, content);
console.log('done');
