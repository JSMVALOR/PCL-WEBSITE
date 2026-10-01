const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', 'utf8');

// Change the modal container to full screen
file = file.replace(
    /<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4 bg-black\/60 backdrop-blur-md animate-fade-in">/,
    '<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">'
);

file = file.replace(
    /<div className="bg-themePanel w-full max-w-4xl h-\[90vh\] rounded-\[2rem\] flex flex-col overflow-hidden border border-themeBorder shadow-2xl">/,
    '<div className="bg-themeApp w-full h-full flex flex-col overflow-hidden shadow-2xl">'
);

// Add the 'isFullScreen' variable so it's fully edge-to-edge
file = file.replace(
    /<div className="bg-themePanel\/95 backdrop-blur-3xl px-8 py-6 relative shrink-0 border-b border-themeBorder flex justify-between items-center z-10">/,
    '<div className="bg-themePanel/60 backdrop-blur-3xl px-6 lg:px-8 py-5 relative shrink-0 border-b border-themeBorder flex justify-between items-center z-10 shadow-sm">'
);

fs.writeFileSync('Frontend/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx', file);
