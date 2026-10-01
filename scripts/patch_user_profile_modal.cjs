const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx', 'utf8');

// Ensure createPortal is imported
if (!file.includes('createPortal')) {
    file = file.replace(/import React, \{ useState, useEffect \} from "react";/, 'import React, { useState, useEffect } from "react";\nimport { createPortal } from "react-dom";');
}

// Replace the return statement wrapper
const oldWrapper = /return \(\s*<div className="w-full flex flex-col bg-themeApp animate-fade-in font-sans border border-themeBorder rounded-3xl overflow-hidden shadow-sm">/;
const newWrapper = `return createPortal(
 <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
 <div className="w-full h-full bg-themeApp flex flex-col font-sans overflow-hidden shadow-2xl">`;

file = file.replace(oldWrapper, newWrapper);

// Change the inner flex-col to overflow-y-auto so the content scrolls
// The inner container is currently: <div className="w-full mx-auto flex flex-col relative z-10 bg-themePanel/85 backdrop-blur-2xl">
file = file.replace(
    /<div className="w-full mx-auto flex flex-col relative z-10 bg-themePanel\/85 backdrop-blur-2xl">/,
    '<div className="w-full mx-auto flex flex-col relative z-10 bg-themePanel/85 backdrop-blur-2xl flex-1 overflow-y-auto custom-scrollbar">'
);

// Fix the bottom closing tags
const oldClosing = /<\/div>\s*<\/div>\s*<AvatarCropperModal/;
const newClosing = `</div>
 </div>
 </div>,
 document.body
 );\n\n // To make cropper work, we should keep it outside the portal or inside. Actually, it's fine inside.
 return createPortal(
 <div className="fixed inset-0 z-[100] flex flex-col bg-themeApp animate-fade-in font-sans overflow-y-auto custom-scrollbar">
`;

// Wait, doing this via string replacement might be brittle.
// Let's use a precise replacement.
