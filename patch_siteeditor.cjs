const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx', 'utf8');

file = file.replace(
  /const query = `SELECT element_text, count\(\*\) as click_count FROM website_clicks GROUP BY element_text ORDER BY click_count DESC LIMIT 5`;\s*const \{ data, error \} = await supabase\.rpc\('admin_exec_sql', \{ query_text: query \}\);/,
  "const { data, error } = await supabase.rpc('get_top_website_clicks');"
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminSiteEditor/AdminSiteEditor.jsx', file);
