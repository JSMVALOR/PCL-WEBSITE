const fs = require('fs');
let code = fs.readFileSync('src/ERP/components/Student/Internships/Internships.jsx', 'utf8');

// 1. Update State & Cache keys
code = code.replace(/const CK = \{ exp: 'int_experiences', noc: 'int_nocs', prac: 'int_practical' \};/, "const CK = { exp: 'int_experiences', noc: 'int_perms', prac: 'int_practical' };");
code = code.replace(/const \[nocRequests, setNocRequests\] = useState\(\(\) => readCache\(CK.noc, \[\]\)\);/, "const [permissions, setPermissions] = useState(() => readCache(CK.noc, []));");
code = code.replace(/const \[showNocModal, setShowNocModal\] = useState\(false\);/, "const [showPermModal, setShowPermModal] = useState(false);");
code = code.replace(/const \[nocUrl, setNocUrl\] = useState\(''\);/, "const [permUrl, setPermUrl] = useState('');");
code = code.replace(/const \[nocForm, setNocForm\] = useState\(\{ company_name: "", start_date: "", end_date: "" \}\);/, "const [permForm, setPermForm] = useState({ company_name: "", start_date: "", end_date: "" });");

// 2. Update fetchAll
code = code.replace(/setNocRequests\(nocRes.value.data\);/, "setPermissions(nocRes.value.data);");

// 3. Update handleNocSubmit -> handlePermSubmit
code = code.replace(/const handleNocSubmit = async/g, "const handlePermSubmit = async");
code = code.replace(/if \(!nocUrl\)/g, "if (!permUrl)");
code = code.replace(/nocUrl\.includes/g, "permUrl.includes");
code = code.replace(/nocForm\.company_name/g, "permForm.company_name");
code = code.replace(/nocForm\.start_date/g, "permForm.start_date");
code = code.replace(/nocForm\.end_date/g, "permForm.end_date");
code = code.replace(/offer_letter_path: nocUrl/g, "offer_letter_path: permUrl");
code = code.replace(/setShowNocModal\(false\)/g, "setShowPermModal(false)");
code = code.replace(/setNocUrl\(''\)/g, "setPermUrl('')");
code = code.replace(/setNocForm\(\{/g, "setPermForm({");
code = code.replace(/Failed to route NOC request/g, "Failed to route Permission request");

// 4. Update TABS
code = code.replace(/\{ id: 'noc', label: 'NOC Requests', icon: 'fa-file-signature' \},/, "");

// 5. Update header buttons
const oldHeader = ` <button type="button" onClick={() => setShowExpModal(true)} className="px-5 py-2.5 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Log Experience
 </button>`;
const newHeader = ` <div className="flex flex-wrap items-center gap-3">
 <button type="button" onClick={() => setShowPermModal(true)} className="px-5 py-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-paper-plane"></i> Apply Permission
 </button>
 <button type="button" onClick={() => setShowExpModal(true)} className="px-5 py-2.5 bg-themeText hover:bg-themeText/90 text-themePanel rounded-[2rem] text-[10px] lg:text-[14px] font-medium tracking-normal transition active:scale-[0.98] flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Log Experience
 </button>
 </div>`;
code = code.replace(oldHeader, newHeader);

// 6. Delete view === "noc"
const nocViewStart = code.indexOf('{/* ═══════════════ NOC REQUESTS ═══════════════ */}');
const cleViewStart = code.indexOf('{/* ═══════════════ CLE DIARIES ═══════════════ */}');
if (nocViewStart !== -1 && cleViewStart !== -1) {
    code = code.slice(0, nocViewStart) + code.slice(cleViewStart);
}

// 7. Render Permissions above Experiences
const expGridStart = code.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">');
const permissionsRender = `
 {permissions.length > 0 && (
 <div className="flex flex-col gap-4 mb-8">
 <h3 className="text-sm font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest"><i className="fa-solid fa-paper-plane mr-1.5 text-blue-500"></i> Active Applications</h3>
 <div className="flex flex-col gap-3">
 {permissions.map(p => (
 <div key={p.id} className="bg-themePanel border-theme border-themeBorderStrong p-4 rounded-2xl border border-black/10 dark:border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h4 className="text-sm font-bold text-themeText dark:text-white">{p.company_name}</h4>
 <p className="text-[10px] lg:text-xs text-themeTextSec dark:text-white/50 font-medium">{p.duration}</p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <div className={\`w-2 h-2 rounded-full \${p.status === 'approved_by_mentor' || p.status === 'approved_by_admin' ? 'bg-emerald-500' : p.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}\`}></div>
 <span className={\`text-[10px] lg:text-xs font-bold uppercase tracking-widest \${p.status === 'approved_by_mentor' || p.status === 'approved_by_admin' ? 'text-emerald-500' : p.status === 'rejected' ? 'text-rose-500' : 'text-amber-500'}\`}>
 {p.status.replace(/_/g, ' ')}
 </span>
 </div>
 {p.status.includes('approved') && (
 <button type="button" onClick={() => handlePrintNoc(p)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20 transition-colors">
 <i className="fa-solid fa-print"></i> NOC
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 `;
code = code.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">', permissionsRender + '<div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">');

// 8. Update NOC Modal to Permission Modal
code = code.replace('{/* B. NOC MODAL */}', '{/* B. PERMISSION MODAL */}');
code = code.replace(/showNocModal/g, "showPermModal");
code = code.replace(/Request NOC/g, "Apply for Internship Permission");
code = code.replace(/NOC Routed to Mentor/g, "Application Routed to Mentor");
code = code.replace(/Submit NOC Request/g, "Submit Application");
code = code.replace(/handleNocSubmit/g, "handlePermSubmit");

fs.writeFileSync('src/ERP/components/Student/Internships/Internships.jsx', code);
console.log("Patched Internships.jsx");
