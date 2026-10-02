const fs = require('fs');

const admFile = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let admContent = fs.readFileSync(admFile, 'utf8');

// 1. Remove toggle state
admContent = admContent.replace(
  ` const [isSpotOpen, setIsSpotOpen] = useState(false);\n const [enableWhatsApp, setEnableWhatsApp] = useState(true);`,
  ` const [isSpotOpen, setIsSpotOpen] = useState(false);`
);

// 2. Remove toggle UI
admContent = admContent.replace(
  `<div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 lg:ml-3">
 <input type="checkbox" checked={enableWhatsApp} onChange={e => setEnableWhatsApp(e.target.checked)} className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" id="wa_toggle_adm" />
 <label htmlFor="wa_toggle_adm" className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer select-none whitespace-nowrap">
 Send WhatsApp
 </label>`,
  ``
);

// 3. Remove WA logic
admContent = admContent.replace(
  `  if (app.phone && enableWhatsApp) {
      addLog(\`[WHATSAPP] Dispatching credentials via WhatsApp to \${app.phone}...\`);
      const waMessage = \`Welcome to Prudentia College of Law!\\n\\nYour ERP Credentials have been generated:\\n*ID:* \${generatedId}\\n*Password:* \${generatedPassword}\\n\\nPlease login at the portal and change your password immediately.\`;
      try {
          await sendSystemWhatsApp(app.phone, waMessage);
          addLog(\`[SUCCESS] Credentials sent successfully via WhatsApp!\`);
      } catch (waErr) {
          addLog(\`[WARNING] WhatsApp dispatch failed: \${waErr.message}\`);
      }
  }`,
  ``
);

// 4. Fix UI closing tags if needed (I previously added </div> so need to check if it's correct)
// Wait, in update-ui.cjs I replaced:
// {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
// </button>
// with:
// {isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
// </button>
// </div>
// <div className="flex items-center gap-3 ...

admContent = admContent.replace(
  `{isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </div>
 
 </div>
  </>`,
  `{isTogglingStatus ? 'Processing...' : (isAdmissionsOpen ? 'Close Admissions' : 'Open Admissions')}
 </button>
 </div>
  </>`
);


fs.writeFileSync(admFile, admContent);
console.log('done');
