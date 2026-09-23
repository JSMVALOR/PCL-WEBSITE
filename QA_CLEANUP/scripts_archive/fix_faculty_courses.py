import re

with open('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'r') as f:
    content = f.read()

# 1. Update handleDeleteResource to add confirm and success alert
old_handle = """const handleDeleteResource = async (id) => {
 
 try {
 await supabase.from('course_resources').delete().eq('id', id);
 setResources(resources.filter(r => r.id !== id));
 } catch (error) {}
 };"""

new_handle = """const handleDeleteResource = async (id) => {
    if (window.erpDialog) {
        window.erpDialog.confirm("Delete this resource?", "Are you sure?").then(async (yes) => {
            if (!yes) return;
            try {
                await supabase.from('course_resources').delete().eq('id', id);
                setResources(prev => prev.filter(r => r.id !== id));
                window.erpDialog.alert("Resource deleted successfully.", "success");
            } catch (error) {
                console.error(error);
                window.erpDialog.alert("Failed to delete resource.", "error");
            }
        });
    } else {
        if (!confirm("Are you sure?")) return;
        try {
            await supabase.from('course_resources').delete().eq('id', id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (error) {}
    }
};"""

if old_handle in content:
    content = content.replace(old_handle, new_handle)
else:
    # try regex
    content = re.sub(r'const handleDeleteResource = async \(id\) => \{.*?setResources\(resources\.filter\(r => r\.id !== id\)\);\s*\} catch \(error\) \{\}\s*\};', new_handle, content, flags=re.DOTALL)

# 2. Replace HoldButton with regular button
old_btn = r'<HoldButton size="sm" onHold=\{\(\) => handleDeleteResource\(res\.id\)\} radius=\{8\} backgroundColor="rgba\(244,63,94,0\.1\)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon=\{<HugeiconsIcon icon=\{Delete02Icon\} size=\{16\} />\}>\s*\{null\}\s*</HoldButton>'
new_btn = r"""<button onClick={() => handleDeleteResource(res.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 transition">
                    <i className="fa-solid fa-trash-can text-sm"></i>
                </button>"""
content = re.sub(old_btn, new_btn, content, flags=re.DOTALL)

with open('src/ERP/components/Faculty/FacultyCourses/FacultyCourses.jsx', 'w') as f:
    f.write(content)

