const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', 'utf8');

const xButtonHtml = `<button onClick={() => setShowProvisionModal(false)} className="absolute top-4 right-6 z-[210] w-10 h-10 bg-themeElevated hover:bg-rose-500 hover:text-white border border-themeBorder text-themeText transition-colors rounded-full flex items-center justify-center">
            <i className="fa-solid fa-xmark"></i>
        </button>`;

file = file.replace(xButtonHtml, '');

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/UserManagement.jsx', file);
