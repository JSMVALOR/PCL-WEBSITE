const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/shared/OrganizationDirectory/OrganizationDirectory.jsx', 'utf8');

if (!file.includes('useERP')) {
  file = file.replace(
    "import { getLocalAvatar } from '../../../utils/avatarUtils';",
    "import { getLocalAvatar } from '../../../utils/avatarUtils';\nimport { useERP } from '../../context/ErpContext';\nimport { HugeiconsIcon } from '@hugeicons/react';\nimport { Chatting01Icon } from '@hugeicons/core-free-icons';"
  );
}

if (!file.includes('userSession')) {
  file = file.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    "const [searchQuery, setSearchQuery] = useState('');\n const { userSession } = useERP();"
  );
}

const messageButtonHTML = `
              </div>
              
              {/* Message Action Button */}
              {!(userSession?.role === 'student' && member.role === 'student') && member.id !== userSession?.db_id && (
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('openGlobalChat', { detail: { userId: member.id, name: member.full_name, role: member.role, avatar: member.profile_picture_url } }))}
                  className="mt-3 w-full py-2 rounded-lg bg-themeElevated hover:bg-themeAccent hover:text-white border border-themeBorder text-themeTextSec text-[11px] font-bold transition flex items-center justify-center gap-2 group/btn"
                >
                  <HugeiconsIcon icon={Chatting01Icon} size={14} className="group-hover/btn:scale-110 transition-transform" />
                  Direct Message
                </button>
              )}
            </div>
          </motion.div>
`;

file = file.replace(
  /<\/div>\s*<\/div>\s*<\/motion\.div>/g,
  messageButtonHTML
);

fs.writeFileSync('Frontend/ERP/components/shared/OrganizationDirectory/OrganizationDirectory.jsx', file);
