const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');
const lines = file.split('\n');

// Import createPortal
let updatedFile = "";
if (!file.includes('createPortal')) {
    const importStr = "import React, { useState, useEffect } from \"react\";\nimport { createPortal } from 'react-dom';";
    updatedFile = file.replace('import React, { useState, useEffect } from "react";', importStr);
} else {
    updatedFile = file;
}
if (!updatedFile.includes('UserProvisioningHub')) {
    updatedFile = updatedFile.replace(
        "import AdminUserProfileModal from './AdminUserProfileModal';",
        "import AdminUserProfileModal from './AdminUserProfileModal';\nimport UserProvisioningHub from './UserProvisioningHub';"
    );
}

const updatedLines = updatedFile.split('\n');
const startLineIndex = updatedLines.findIndex(line => line.includes('/* 3. PROVISIONING WIZARD MODAL */'));
const endLineIndex = updatedLines.findIndex((line, index) => index > startLineIndex && line.includes('/* 4. ADMIN QUESTIONNAIRE OVERRIDE MODAL */'));

// Delete lines between startLineIndex and endLineIndex, and insert the portal snippet
const newSnippet = ` {/* 3. PROVISIONING WIZARD MODAL */}
 {showProvisionModal && createPortal(
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
 )}

`;

const finalLines = [
    ...updatedLines.slice(0, startLineIndex),
    newSnippet,
    ...updatedLines.slice(endLineIndex)
];

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', finalLines.join('\n'));
console.log('Replaced inline modal with UserProvisioningHub portal');
