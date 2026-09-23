import re

with open('src/ERP/components/Student/Notices/Notices.jsx', 'r') as f:
    content = f.read()

old_code = """const { error } = await supabase.from('notices').delete().eq('id', selectedNotice.id);
                                        if (!error) {"""
new_code = """const { data, error } = await supabase.from('notices').delete().eq('id', selectedNotice.id).select();
                                        if (!error && data && data.length > 0) {
                                        } else if (!error && (!data || data.length === 0)) {
                                            window.erpDialog?.alert("Access Denied: You do not have permission to delete this notice (RLS blocked).", "Error");"""
content = content.replace(old_code, new_code)

with open('src/ERP/components/Student/Notices/Notices.jsx', 'w') as f:
    f.write(content)
