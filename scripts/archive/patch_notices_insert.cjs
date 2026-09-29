const fs = require('fs');
let content = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

content = content.replace(
    /const \{ error \} = await supabase\.from\('notices'\)\.insert\(\[\{([\s\S]*?)\}\]\);/,
    `const { error } = await supabase.from('notices').insert([{
            $1,
            notice_id: \`CIR-\${new Date().getFullYear()}-\${Math.floor(Math.random() * 9000) + 1000}\`,
            author_name: userSession?.full_name || userSession?.name || 'Admin'
        }]);`
);

content = content.replace(
    /if \(isPublicWebsite\) \{[\s\S]*?await supabase\.from\('admin_notices'\)\.insert\(\[\{([\s\S]*?)\}\]\);[\s\S]*?\}/,
    `if (isPublicWebsite) {
            try {
                await supabase.from('admin_notices').insert([{
                    $1
                }]);
            } catch(e) { console.error("Could not insert to admin_notices", e); }
        }`
);

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', content);
console.log("Patched AdminNotices insertion");
