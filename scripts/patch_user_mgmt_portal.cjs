const fs = require('fs');

let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

// Ensure react-dom createPortal is imported
if (!file.includes('createPortal')) {
    file = file.replace(
        "import React, { useState, useEffect } from \"react\";",
        "import React, { useState, useEffect } from \"react\";\nimport { createPortal } from 'react-dom';"
    );
}

// Wrap the inline block with createPortal(..., document.body)
const inlineModalStart = '{showProvisionModal && (';
const inlineModalPattern = /\{showProvisionModal && \([\s\S]*?<UserProvisioningHub[\s\S]*?\/>\s*<\/div>\s*\)\}/g;

file = file.replace(inlineModalPattern, 
`{showProvisionModal && createPortal(
    <div className="fixed inset-0 z-[200] bg-themeApp animate-fade-in flex flex-col">
        <button onClick={() => setShowProvisionModal(false)} className="absolute top-4 right-6 z-[210] w-10 h-10 bg-themeElevated hover:bg-rose-500 hover:text-white border border-themeBorder text-themeText transition-colors rounded-full flex items-center justify-center">
            <i className="fa-solid fa-xmark"></i>
        </button>
        <UserProvisioningHub 
            onClose={() => setShowProvisionModal(false)} 
            provisionClient={provisionClient} 
            onProvisioned={() => {
                fetchUsers();
            }} 
        />
    </div>,
    document.body
)}`);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);
