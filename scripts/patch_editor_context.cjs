const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

// Add import if not exists
if (!file.includes('useErp')) {
    file = file.replace(
        /import React, \{ useState, useEffect, useRef \} from "react";/,
        'import React, { useState, useEffect, useRef } from "react";\nimport { useErp } from "../../../context/ErpContext";'
    );
}

// Add hook usage inside the component
if (!file.includes('const { userSession, refreshProfile } = useErp();')) {
    file = file.replace(
        /export default function AdminUserEditorModal\(\{ user, isOpen, onClose, onUpdate \}\) \{/,
        'export default function AdminUserEditorModal({ user, isOpen, onClose, onUpdate }) {\n  const { userSession, refreshProfile } = useErp();'
    );
}

// Add refreshProfile() call inside handleSubmit
if (!file.includes('if (user.db_id === userSession?.db_id) {')) {
    const successBlock = 'onUpdate();\n    if (user.db_id === userSession?.db_id) {\n      refreshProfile();\n    }\n    onClose();';
    file = file.replace(/onUpdate\(\);\s*onClose\(\);/, successBlock);
}

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);
