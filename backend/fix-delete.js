const fs = require('fs');
const file = '../Frontend/ERP/components/Admin/AdminWebsiteHub/AdminGalleryManager.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = "  const { error } = await supabase.from('gallery_images').delete().eq('id', img.id);\n  if (error) throw error;\n  if (window.erpToast) window.erpToast.show(\"Image deleted successfully!\", \"success\");";

const replacement = `  const { data, error } = await supabase.from('gallery_images').delete().eq('id', img.id).select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No rows deleted. Likely an RLS Policy issue.");
  if (window.erpToast) window.erpToast.show("Image deleted successfully!", "success");`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Success');
} else {
  console.log('Target not found. Here is what is in the file around line 326:');
  console.log(content.split('\n').slice(320, 335).join('\n'));
}
