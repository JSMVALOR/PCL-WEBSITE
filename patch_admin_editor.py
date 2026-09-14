import re

filepath = 'src/ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx'
with open(filepath, 'r') as f:
    text = f.read()

# Add new states
new_states = """  const [formData, setFormData] = useState({
    full_name: '',
    erp_id: '',
    academic_batch: '',
    department: '',
    phone: '',
    // Faculty specific
    designation: '',
    specialisation: '',
    image_url: '',
    bio: '',
    research: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExtraDetails = async () => {
      if (user && isOpen) {
        let initialData = {
          full_name: user.name || '',
          erp_id: user.id || '',
          academic_batch: user.batch || '',
          department: user.department || '',
          phone: user.phone || '',
          designation: '',
          specialisation: '',
          image_url: '',
          bio: '',
          research: ''
        };

        if (user.role === 'faculty') {
          try {
            const { data } = await supabase.from('faculty_profiles').select('*').eq('id', user.db_id).maybeSingle();
            if (data) {
              initialData.designation = data.designation || '';
              initialData.specialisation = data.specialisation || '';
              initialData.image_url = data.image_url || '';
              initialData.bio = data.bio || '';
              initialData.research = data.research ? (Array.isArray(data.research) ? data.research.join(', ') : data.research) : '';
            }
          } catch(e) {}
        }
        setFormData(initialData);
      }
    };
    fetchExtraDetails();
  }, [user, isOpen]);"""

text = re.sub(
    r'const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);\s*const \[isSaving, setIsSaving\] = useState\(false\);\s*useEffect\(\(\) => \{[\s\S]*?\}, \[user, isOpen\]\);',
    new_states,
    text
)

# Update handleSubmit
new_submit = """  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          erp_id: formData.erp_id,
          academic_batch: formData.academic_batch,
          department: formData.department,
          phone: formData.phone
        })
        .eq('id', user.db_id);

      if (error) throw error;

      if (user.role === 'faculty') {
        const researchArray = formData.research.split(',').map(s => s.strip()).filter(Boolean);
        const { error: facError } = await supabase
          .from('faculty_profiles')
          .upsert({
            id: user.db_id,
            designation: formData.designation,
            specialisation: formData.specialisation,
            image_url: formData.image_url,
            bio: formData.bio,
            research: researchArray
          }, { onConflict: 'id' });
        if (facError) throw facError;
      }
      
      window.erpToast.success("User details updated successfully");
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      window.erpToast.error("Failed to update user details");
    } finally {
      setIsSaving(false);
    }
  };"""

# I need to be careful with s.strip(). In JS it is s.trim()
new_submit = new_submit.replace('s.strip()', 's.trim()')

text = re.sub(
    r'const handleSubmit = async \(e\) => \{[\s\S]*?finally \{\s*setIsSaving\(false\);\s*\}\s*\};',
    new_submit,
    text
)

# Update form JSX
new_jsx = """          {user.role === 'faculty' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Department</label>
                <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Designation</label>
                <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="e.g. Founder & Professor" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Specialisation</label>
                <input type="text" value={formData.specialisation} onChange={e => setFormData({...formData, specialisation: e.target.value})} placeholder="e.g. Constitutional Law" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Profile Image URL</label>
                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="/assets/people/faculty.jpg" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Bio</label>
                <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors resize-none"></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-themeTextSec">Research Interests (Comma separated)</label>
                <input type="text" value={formData.research} onChange={e => setFormData({...formData, research: e.target.value})} placeholder="Corporate Law, Human Rights" className="w-full bg-themeElevated/90 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText focus:border-themeAccent focus:outline-none transition-colors" />
              </div>
            </>
          )}"""

text = re.sub(
    r'\{user\.role === \'faculty\' && \([\s\S]*?\}\)',
    new_jsx,
    text
)

# Add scrolling to the modal so it doesn't overflow the screen
text = text.replace(
    'className="flex flex-col gap-4"',
    'className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2"'
)

with open(filepath, 'w') as f:
    f.write(text)
print("Admin Modal Patched")
