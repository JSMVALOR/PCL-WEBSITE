const fs = require('fs');
const file = 'ERP/components/Admin/UserManagement/AdminUserEditorModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Initial State
content = content.replace(
  /phone: user\.phone \|\| '',/g,
  `phone: user.phone || '',
    joining_date: user.joining_date || '',
    admission_type: user.admission_type || '',`
);

// 2. Add UI fields
const oldUI = ` <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">WhatsApp Number</label>
 <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder focus:border-themeAccent rounded-xl py-3 px-4 text-[13px] font-semibold text-themeText outline-none transition" />
 </div>
 </div>`;

const newUI = ` <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">WhatsApp Number</label>
 <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder focus:border-themeAccent rounded-xl py-3 px-4 text-[13px] font-semibold text-themeText outline-none transition" />
 </div>
 {formData.role === 'student' && (
   <>
     <div>
     <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Joining Date</label>
     <input type="date" value={formData.joining_date} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder focus:border-themeAccent rounded-xl py-3 px-4 text-[13px] font-semibold text-themeText outline-none transition" />
     </div>
     <div>
     <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Admission Wave/Type</label>
     <input type="text" value={formData.admission_type} onChange={(e) => setFormData({ ...formData, admission_type: e.target.value })} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder focus:border-themeAccent rounded-xl py-3 px-4 text-[13px] font-semibold text-themeText outline-none transition" placeholder="e.g. LAWCET Phase 1" />
     </div>
   </>
 )}
 </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(file, content);
console.log('done');
