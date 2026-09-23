const fs = require('fs');
let p = 'src/ERP/components/Student/StudentDashboard/StudentDashboard.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    "await supabase.from('notices').select('*').eq('status', 'PUBLISHED').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5);",
    "await supabase.from('notices').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5).catch(() => ({ data: [] }));"
);

fs.writeFileSync(p, c);
console.log("Notices query patched");
