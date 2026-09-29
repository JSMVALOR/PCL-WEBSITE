const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

// 1. Z-index fix for TargetAudienceSelector
content = content.replace(
    /<div>\s*<TargetAudienceSelector value=\{targetAudience\}/g,
    '<div className="relative z-[60]">\n <TargetAudienceSelector value={targetAudience}'
);

// 2. Make form horizontal and notices below it
// Find the grid container: <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
content = content.replace(
    /<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">/,
    '<div className="flex flex-col gap-12 w-full">'
);

// Form wrapper: <div className="lg:col-span-5 h-max py-4"> -> w-full
content = content.replace(
    /<div className="lg:col-span-5 h-max py-4">/,
    '<div className="w-full">'
);

// Add grid to form: <form onSubmit={handlePublishNotice} className="flex flex-col gap-4">
content = content.replace(
    /<form onSubmit=\{handlePublishNotice\} className="flex flex-col gap-4">/,
    '<form onSubmit={handlePublishNotice} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">'
);

// Title wrapper: <div> -> <div className="col-span-1 lg:col-span-2">
content = content.replace(
    /<div>\s*<label className="text-\[13px\] font-medium text-themeTextSec mb-2 block">Title<\/label>/,
    '<div className="col-span-1 lg:col-span-2">\n <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Title</label>'
);

// The Category and Priority are wrapped in <div className="grid grid-cols-2 gap-4"> -> Replace with col-span-1 lg:col-span-2 flex gap-4
content = content.replace(
    /<div className="grid grid-cols-2 gap-4">/,
    '<div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">'
);

// Target audience wrapper: <div className="relative z-\[60\]"> -> <div className="col-span-1 lg:col-span-2 relative z-[60]">
content = content.replace(
    /<div className="relative z-\[60\]">\s*<TargetAudienceSelector/g,
    '<div className="col-span-1 lg:col-span-2 relative z-[60]">\n <TargetAudienceSelector'
);

// Content wrapper: <div> -> <div className="col-span-1 lg:col-span-4">
content = content.replace(
    /<div>\s*<label className="text-\[13px\] font-medium text-themeTextSec mb-2 block">Content<\/label>/,
    '<div className="col-span-1 lg:col-span-4">\n <label className="text-[13px] font-medium text-themeTextSec mb-2 block">Content</label>'
);

// External Link wrapped in <div className="grid grid-cols-1 gap-4"> -> <div className="col-span-1 lg:col-span-2">
content = content.replace(
    /<div className="grid grid-cols-1 gap-4">\s*<div>\s*<label className="text-\[13px\] font-medium text-themeTextSec mb-2 block">External Link/g,
    '<div className="col-span-1 lg:col-span-2">\n <label className="text-[13px] font-medium text-themeTextSec mb-2 block">External Link'
);
// Remove the extra </div> closing grid
content = content.replace(
    /placeholder="https:\/\/..." \/>\s*<\/div>\s*<\/div>/,
    'placeholder="https://..." />\n </div>'
);

// Publish to Public wrapper -> <label className="col-span-1 lg:col-span-2 flex...
content = content.replace(
    /<label className="flex items-center justify-between p-4 bg-black\/5 dark:bg-white\/5 backdrop-blur-3xl saturate-\[1\.8\] border border-black\/5 dark:border-white\/10 rounded-xl cursor-pointer">/,
    '<label className="col-span-1 lg:col-span-2 flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-xl cursor-pointer h-fit">'
);

// Button Wrapper
content = content.replace(
    /<button type="submit" disabled=\{isPublishing\} className="btn-erp disabled:cursor-not-allowed">/,
    '<div className="col-span-1 lg:col-span-4 flex justify-end mt-2">\n <button type="submit" disabled={isPublishing} className="btn-erp disabled:cursor-not-allowed w-full md:w-auto">'
);
content = content.replace(
    /{isPublishing \? 'Broadcasting\.\.\.' : 'Publish Notice'}\s*<\/button>/,
    '{isPublishing ? \'Broadcasting...\' : \'Publish Notice\'}\n </button>\n </div>'
);

// Active Broadcasts List wrapper: <div className="lg:col-span-7 flex flex-col gap-4"> -> w-full
content = content.replace(
    /<div className="lg:col-span-7 flex flex-col gap-4">/,
    '<div className="w-full flex flex-col gap-4">'
);

// Make the list a horizontal row of cards
content = content.replace(
    /\{notices\.map\(n => \(/,
    '<div className="flex overflow-x-auto snap-x no-scrollbar gap-6 pb-6">\n {notices.map(n => ('
);
content = content.replace(
    /className="py-5 border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] flex flex-col gap-3 relative overflow-hidden group transition-opacity hover:opacity-80"/,
    'className="min-w-[320px] max-w-[320px] snap-start bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col gap-3 relative overflow-hidden group transition-opacity hover:opacity-80 shrink-0"'
);

// Add the closing div for the horizontal scroll wrapper
content = content.replace(
    /<\/div>\s*\)\)}\s*<\/div>\s*<\/div>\s*\);/g,
    '</div>\n ))}\n </div>\n </div>\n </div>\n );'
);


fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', content);
console.log("Patched AdminNotices.");
