import re

with open('src/ERP/components/Admin/UserManagement/UserManagement.jsx', 'r') as f:
    text = f.read()

# Add import
import_stmt = "import AdminUserEditorModal from './AdminUserEditorModal';\n"
text = text.replace("import AdminUserProfileModal", import_stmt + "import AdminUserProfileModal")

# Add state
state_stmt = "  const [editBasicUserId, setEditBasicUserId] = useState(null);\n"
text = text.replace("const [editFacultyId, setEditFacultyId]", state_stmt + "  const [editFacultyId, setEditFacultyId]")

# Add icon in desktop table row
desktop_btn = """<button onClick={() => setEditBasicUserId(user)} className="w-8 h-8 rounded-lg bg-themeApp border border-black/5 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-400 text-themeTextSec flex items-center justify-center transition-colors" title="Edit Master Details">
 <i className="fa-solid fa-pen text-[10px]"></i>
 </button>
 """
text = text.replace("{activeTab === 'students' && (\\n <button onClick={() => setCvStudentId", desktop_btn + "{activeTab === 'students' && (\n <button onClick={() => setCvStudentId")

# Add icon in mobile card view
mobile_btn = """<button onClick={() => setEditBasicUserId(user)} className="w-8 h-8 rounded-lg bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-400 text-themeTextSec flex items-center justify-center transition-colors" title="Edit Master Details">
 <i className="fa-solid fa-pen text-[10px]"></i>
 </button>
 """
text = text.replace("{user.role === 'faculty' && (\\n <button onClick={() => setEditFacultyId", mobile_btn + "{user.role === 'faculty' && (\n <button onClick={() => setEditFacultyId")

# Add Modal
modal_stmt = """
      <AdminUserEditorModal
        user={editBasicUserId}
        isOpen={!!editBasicUserId}
        onClose={() => setEditBasicUserId(null)}
        onUpdate={fetchDirectory}
      />
"""
text = text.replace("{editFacultyId && (", modal_stmt + "\n      {editFacultyId && (")

with open('src/ERP/components/Admin/UserManagement/UserManagement.jsx', 'w') as f:
    f.write(text)
