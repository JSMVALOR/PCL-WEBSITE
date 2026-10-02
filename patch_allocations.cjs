const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { getAvatarUrl }')) {
  code = code.replace("import { getLocalAvatar } from '../../../utils/avatarUtils';", "import { getAvatarUrl } from '../../../utils/avatarUtils';");
}

code = code.replace(/s\.profile_picture_url \|\| getLocalAvatar\(s\.full_name\)/g, 'getAvatarUrl(s)');
code = code.replace(/f\.profile_picture_url \|\| getLocalAvatar\(f\.full_name\)/g, 'getAvatarUrl(f)');

fs.writeFileSync(file, code);
console.log("Patched MentorshipAllocations");
