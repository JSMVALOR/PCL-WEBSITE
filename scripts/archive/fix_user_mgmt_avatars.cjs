const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

// Insert import
if (!file.includes('getLocalAvatar')) {
    file = file.replace("import AdminPasswordResetsModal from './AdminPasswordResetsModal';", "import AdminPasswordResetsModal from './AdminPasswordResetsModal';\nimport { getLocalAvatar } from '../../../utils/avatarUtils';");
}

// Update avatar_url assignment
file = file.replace(/avatar_url: p\.profile_picture_url \|\| p\.avatar_url,/g, 'avatar_url: p.profile_picture_url || getLocalAvatar(p.full_name) || p.avatar_url,');

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);

let topNav = fs.readFileSync('Frontend/ERP/components/shared/TopNav.jsx', 'utf8');
if (!topNav.includes('getLocalAvatar')) {
    topNav = topNav.replace("import { ErpContext } from '../../context/ErpContext';", "import { ErpContext } from '../../context/ErpContext';\nimport { getLocalAvatar } from '../../utils/avatarUtils';");
}

// TopNav has `{userSession?.profile_picture_url && ...}` check.
// We can just redefine userSession locally or inject the call.
// Let's replace the condition to also check local avatar.
topNav = topNav.replace(/userSession\?\.profile_picture_url/g, '(userSession?.profile_picture_url || getLocalAvatar(userSession?.name))');

// And fix the image src usage in TopNav
topNav = topNav.replace(/userSession\.profile_picture_url\.match/g, '(userSession.profile_picture_url || getLocalAvatar(userSession?.name)).match');
topNav = topNav.replace(/userSession\.profile_picture_url/g, '(userSession.profile_picture_url || getLocalAvatar(userSession?.name))');

fs.writeFileSync('Frontend/ERP/components/shared/TopNav.jsx', topNav);

let modal = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', 'utf8');
if (!modal.includes('getLocalAvatar')) {
    modal = modal.replace("import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';", "import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';\nimport { getLocalAvatar } from '../../../utils/avatarUtils';");
}
modal = modal.replace(/user\.profile_picture_url/g, '(user.profile_picture_url || getLocalAvatar(user.name))');
fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', modal);

console.log("Patched UserManagement, TopNav, and AdminUserProfileModal to use local avatars!");
