const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', 'utf8');

if (!file.includes('createPortal')) {
    file = file.replace(/import React, \{ useState, useEffect \} from "react";/, 'import React, { useState, useEffect } from "react";\nimport { createPortal } from "react-dom";');
}

file = file.replace(
    /return \(\s*<div className="w-full flex flex-col bg-themeApp animate-fade-in font-sans border border-themeBorder rounded-3xl overflow-hidden shadow-sm">/,
    'return createPortal(\n <div className="fixed inset-0 z-[150] flex flex-col bg-themeApp animate-fade-in font-sans overflow-hidden">\n <div className="flex-1 overflow-y-auto w-full mx-auto flex flex-col relative z-10 bg-themePanel/85 custom-scrollbar">\n {/* Wrapper inside portal */}'
);

file = file.replace(
    /<div className="w-full mx-auto flex flex-col relative z-10 bg-themePanel\/85 backdrop-blur-2xl">/,
    '<div className="w-full mx-auto flex flex-col relative z-10">'
);

// We need to close the createPortal call
file = file.replace(
    /<AvatarCropperModal[\s\S]*?\/>\s*<\/div>\s*\);\s*\}\s*$/m,
    (match) => {
        // match contains the avatar cropper and the last </div> ); }
        // We need to change the last </div> ); to </div></div>, document.body );
        let replaced = match.replace(/<\/div>\s*\);\s*\}$/m, '</div>\n </div>,\n document.body\n );\n}');
        return replaced;
    }
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', file);
