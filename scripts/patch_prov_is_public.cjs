const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', 'utf8');

// Add state
file = file.replace(
    /const \[extField3, setExtField3\] = useState\(""\);/,
    'const [extField3, setExtField3] = useState("");\n const [isPublic, setIsPublic] = useState(false);'
);

// Add to payload
file = file.replace(
    /payload\.faculty_type = extField3 \|\| null;/,
    'payload.faculty_type = extField3 || null;\n    payload.is_public = isPublic;'
);

// Add to JSX
const toggleJsx = `
 </div>
 <div className="flex items-center gap-3 bg-themeAccent/10 p-4 mt-2 rounded-xl border border-themeAccent/20">
 <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="w-5 h-5 rounded accent-amber-500 cursor-pointer" id="is_public_toggle" />
 <label htmlFor="is_public_toggle" className="text-xs font-bold text-themeText cursor-pointer select-none">
 Publish to Public Website Directory
 <p className="text-[10px] text-themeTextSec mt-1">If unchecked, this profile is hidden from the faculty page.</p>
 </label>
 </div>
 </div>
 )}`;

file = file.replace(
    /<\/div>\n <\/div>\n \)}/,
    toggleJsx
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserProvisioningHub.jsx', file);
