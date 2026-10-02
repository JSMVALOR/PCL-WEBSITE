const fs = require('fs');

// 1. Update UserProvisioningHub.jsx
const hubFile = 'ERP/components/Admin/UserManagement/UserProvisioningHub.jsx';
let hubContent = fs.readFileSync(hubFile, 'utf8');

// Add state for toggle
hubContent = hubContent.replace(
  ` const [isProvisioning, setIsProvisioning] = useState(false);`,
  ` const [isProvisioning, setIsProvisioning] = useState(false);\n const [enableWhatsApp, setEnableWhatsApp] = useState(true);`
);

// Add toggle to the UI
hubContent = hubContent.replace(
  ` <div className="flex p-1.5 bg-themeApp rounded-xl border border-themeBorder w-full shadow-inner">`,
  ` <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-2">
 <input type="checkbox" checked={enableWhatsApp} onChange={e => setEnableWhatsApp(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" id="wa_toggle" />
 <label htmlFor="wa_toggle" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer select-none">
 Enable WhatsApp Dispatch
 </label>
 </div>
 <div className="flex p-1.5 bg-themeApp rounded-xl border border-themeBorder w-full shadow-inner">`
);

// Pass enableWhatsApp to provisionUser
hubContent = hubContent.replace(
  `const provisionUser = async (name, email, phone, role, assign, currentNextNum) => {`,
  `const provisionUser = async (name, email, phone, role, assign, currentNextNum, sendWa) => {`
);

hubContent = hubContent.replace(
  `let waSent = false;
  if (phone) {`,
  `let waSent = false;
  if (phone && sendWa) {`
);

hubContent = hubContent.replace(
  `const result = await provisionUser(newUserName, newUserEmail, newUserPhone, newUserRole, assignment, null);`,
  `const result = await provisionUser(newUserName, newUserEmail, newUserPhone, newUserRole, assignment, null, enableWhatsApp);`
);

hubContent = hubContent.replace(
  `const result = await provisionUser(name, email, validRows[i].phone, newUserRole, assignTarget, currentNextNum);`,
  `const result = await provisionUser(name, email, validRows[i].phone, newUserRole, assignTarget, currentNextNum, enableWhatsApp);`
);

fs.writeFileSync(hubFile, hubContent);

// 2. Update AdminAdmissions.jsx
const admFile = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let admContent = fs.readFileSync(admFile, 'utf8');

// Remove hardcoded 50k invoice
admContent = admContent.replace(
  /\/\/ 4\.5 Generate Fee Invoice[\s\S]*?\/\/ 5\. Send Welcome Email/,
  `// 5. Send Welcome Email`
);

// Add WA toggle state in Admissions
admContent = admContent.replace(
  ` const [isSpotOpen, setIsSpotOpen] = useState(false);`,
  ` const [isSpotOpen, setIsSpotOpen] = useState(false);\n const [enableWhatsApp, setEnableWhatsApp] = useState(true);`
);

// Add toggle to UI
admContent = admContent.replace(
  `{isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>`,
  `{isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </div>
 <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 lg:ml-3">
 <input type="checkbox" checked={enableWhatsApp} onChange={e => setEnableWhatsApp(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" id="wa_toggle_adm" />
 <label htmlFor="wa_toggle_adm" className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer select-none whitespace-nowrap">
 Send WhatsApp
 </label>`
);

// Use the toggle
admContent = admContent.replace(
  `if (app.phone) {`,
  `if (app.phone && enableWhatsApp) {`
);

fs.writeFileSync(admFile, admContent);

console.log('done');
