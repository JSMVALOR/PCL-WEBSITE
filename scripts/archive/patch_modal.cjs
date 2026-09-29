const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', 'utf8');

file = file.replace(
  "import { getLocalAvatar } from '../../../utils/avatarUtils';",
  "import { getLocalAvatar } from '../../../utils/avatarUtils';\nimport AvatarCropperModal from './AvatarCropperModal';"
);

file = file.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n const [isCropperOpen, setIsCropperOpen] = useState(false);\n const [localAvatarUrl, setLocalAvatarUrl] = useState(null);"
);

const oldImageBlock = `<div className="w-20 h-20 rounded-2xl bg-white dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden shadow-sm p-0.5">
                {user.avatar_url && user.avatar_url !== 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' ? (
                    <img src={user.avatar_url.match(/^(\\/|http)/) ? user.avatar_url : \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true\`} alt={user.name} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                    <img src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true\`} alt={user.name} className="w-full h-full object-cover rounded-[14px]" />
                )}
                </div>`;

const newImageBlock = `<div onClick={() => setIsCropperOpen(true)} className="w-20 h-20 rounded-2xl bg-white dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden shadow-sm p-0.5 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all group relative">
                 <div className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex z-20 rounded-[14px]">
                    <i className="fa-solid fa-crop-simple text-white text-xl"></i>
                 </div>
                 {(localAvatarUrl || user.avatar_url) && (localAvatarUrl || user.avatar_url) !== 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' ? (
                     <img src={(localAvatarUrl || user.avatar_url).match(/^(\\/|http|data)/) ? (localAvatarUrl || user.avatar_url) : \`https://ui-avatars.com/api/?name=\${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true\`} alt={user.name} className="w-full h-full object-cover rounded-[14px]" />
                 ) : (
                     <img src={\`https://ui-avatars.com/api/?name=\${encodeURIComponent(user.name)}&background=random&color=fff&rounded=true&bold=true\`} alt={user.name} className="w-full h-full object-cover rounded-[14px]" />
                 )}
                 </div>`;

file = file.replace(oldImageBlock, newImageBlock);

const endBlock = `</div>
 </div>
 );
}`;

const newEndBlock = `</div>

 <AvatarCropperModal
    user={user}
    currentImageUrl={(localAvatarUrl || user.avatar_url)?.match(/^(\\/|http|data)/) ? (localAvatarUrl || user.avatar_url) : null}
    isOpen={isCropperOpen}
    onClose={() => setIsCropperOpen(false)}
    onSaved={(base64) => setLocalAvatarUrl(base64)}
 />
 </div>
 </div>
 );
}`;

file = file.replace(endBlock, newEndBlock);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', file);
console.log("Patched modal!");
