const fs = require('fs');
const file = '/Users/JSM/Developer/VALOR./WEBSITE REBUILDS/PRUDENTIA COLLEGE OF LAW WEBSITE & ERP/Frontend/ERP/components/Admin/AdminApprovals/AdminApprovals.jsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `<a href={\`https://wa.me/\${g.reporter.phone.replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="w-5 h-5 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer" title="Chat with Reporter">
  <i className="fa-brands fa-whatsapp text-[10px]"></i>
  </a>`;
const replacement1 = `<button type="button" onClick={() => window.dispatchEvent(new CustomEvent('openGlobalChat', { detail: { userId: g.reporter.id, name: g.reporter.full_name, role: g.reporter.role, avatar: g.reporter.profile_picture_url } }))} className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer" title="Message Reporter">
  <i className="fa-solid fa-message text-[10px]"></i>
  </button>`;

const target2 = `<a href={\`https://wa.me/\${g.accused.phone.replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="w-5 h-5 flex items-center justify-center rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer" title="Chat with Accused">
  <i className="fa-brands fa-whatsapp text-[10px]"></i>
  </a>`;
const replacement2 = `<button type="button" onClick={() => window.dispatchEvent(new CustomEvent('openGlobalChat', { detail: { userId: g.accused.id, name: g.accused.full_name, role: g.accused.role, avatar: g.accused.profile_picture_url } }))} className="w-5 h-5 flex items-center justify-center rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer" title="Message Accused">
  <i className="fa-solid fa-message text-[10px]"></i>
  </button>`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

content = content.replace('{g.reporter?.phone && (', '{g.reporter && (');
content = content.replace('{g.accused?.phone && (', '{g.accused && (');

fs.writeFileSync(file, content);
console.log("Done");
