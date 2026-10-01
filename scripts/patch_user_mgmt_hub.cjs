const fs = require('fs');

let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

// Import it
if (!file.includes('UserProvisioningHub')) {
    file = file.replace(
        "import AdminUserProfileModal from './AdminUserProfileModal';",
        "import AdminUserProfileModal from './AdminUserProfileModal';\nimport UserProvisioningHub from './UserProvisioningHub';"
    );
}

// Remove the inline modal and replace with UserProvisioningHub wrapped in a portal or full-screen div
// Let's find the inline modal in UserManagement.jsx
const inlineModalStart = '{showProvisionModal && (';
const inlineModalPattern = /\{showProvisionModal && \([\s\S]*?\)\}/g;

file = file.replace(inlineModalPattern, 
`{showProvisionModal && (
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
    </div>
)}`);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);
