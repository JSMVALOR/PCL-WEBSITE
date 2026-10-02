const fs = require('fs');
const file = '/Users/JSM/Developer/VALOR./WEBSITE REBUILDS/PRUDENTIA COLLEGE OF LAW WEBSITE & ERP/Frontend/ERP/components/Admin/AdminWebsiteHub/AdminGalleryManager.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const { error } = await supabase.from('gallery_images').delete().eq('id', img.id);
  if (error) throw error;
  if (window.erpToast) window.erpToast.show("Image deleted successfully!", "success");`;

const replacement = `  const { data, error } = await supabase.from('gallery_images').delete().eq('id', img.id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No rows deleted. Likely an RLS Policy issue.");
  if (window.erpToast) window.erpToast.show("Image deleted successfully!", "success");`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('done');
