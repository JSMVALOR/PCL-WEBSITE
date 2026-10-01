const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

// Replace Notice HoldButton
file = file.replace(
    /<HoldButton size="sm" onHold=\{\(\) => handleDeleteNotice\(n\.id\)\}[\s\S]*?<\/HoldButton>/,
    `<button onClick={() => handleDeleteNotice(n.id)} className="text-themeTextSec hover:text-rose-500 transition p-2" title="Delete Broadcast"><HugeiconsIcon icon={Delete02Icon} size={16} /></button>`
);

// Replace Event HoldButton
file = file.replace(
    /<HoldButton size="sm" onHold=\{\(\) => handleDeleteEvent\(e\.id\)\}[\s\S]*?<\/HoldButton>/,
    `<button onClick={() => handleDeleteEvent(e.id)} className="text-themeTextSec hover:text-rose-500 transition p-2" title="Delete Event"><HugeiconsIcon icon={Delete02Icon} size={16} /></button>`
);

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', file);
