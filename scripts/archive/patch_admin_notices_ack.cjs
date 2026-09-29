const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

// Remove state
content = content.replace(/const \[requiresAck, setRequiresAck\] = useState\(false\);\n/, '');

// Remove insert field
content = content.replace(/\s*requires_acknowledgement:\s*requiresAck,/, '');

// Remove setRequiresAck(false)
content = content.replace(/\s*setRequiresAck\(false\);/, '');

// Remove UI label block (Wait, the checkbox might be slightly different in AdminNotices.jsx, let's use a simpler regex or manual edit)
// In AdminNotices.jsx:
/*
<label className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl cursor-pointer">
<input type="checkbox" checked={requiresAck} onChange={e => setRequiresAck(e.target.checked)} className="accent-themeAccent w-4 h-4" />
<div>
<span className="text-sm font-bold text-themeText block">Require Acknowledgement</span>
<span className="text-[10px] font-bold text-themeTextSec">Force recipients to digitally sign that they have read this.</span>
</div>
</label>
*/
const uiBlockRegex = /<label className="flex items-center gap-3 p-4 bg-black\/5 dark:bg-white\/5 backdrop-blur-3xl saturate-\[1\.8\] border border-black\/5 dark:border-white\/10 rounded-xl cursor-pointer">\s*<input type="checkbox" checked={requiresAck}[\s\S]*?<\/label>/;
content = content.replace(uiBlockRegex, '');

// Also remove from Feed:
// {n.requires_acknowledgement && <span className="text-[10px] font-bold text-emerald-500"><i className="fa-solid fa-signature mr-1"></i> Requires Signature</span>}
content = content.replace(/\{n\.requires_acknowledgement[\s\S]*?Requires Signature<\/span>}/, '');

fs.writeFileSync(file, content);
