const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/shared/QuestionnaireModal.jsx', 'utf8');

const oldFac = `<div className="flex flex-col gap-2">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Name</label>
 <input type="text" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition" placeholder="Full Name" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Relation</label>
 <select name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition">
 <option value="">Select Relation</option>
 <option value="Father">Father</option>
 <option value="Mother">Mother</option>
 <option value="Guardian">Guardian</option>
 <option value="Sibling">Sibling</option>
 <option value="Spouse">Spouse</option>
 <option value="Other">Other</option>
 </select>
 </div>
 </div>`;

const newFac = `<div className="flex flex-col gap-2">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Name</label>
 <input type="text" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition" placeholder="Full Name" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Relation</label>
 <select name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition">
 <option value="">Select Relation</option>
 <option value="Father">Father</option>
 <option value="Mother">Mother</option>
 <option value="Guardian">Guardian</option>
 <option value="Sibling">Sibling</option>
 <option value="Spouse">Spouse</option>
 <option value="Other">Other</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Phone</label>
 <div className="flex">
 <span className="bg-themeElevated backdrop-blur-[80px] backdrop-blur-2xl shadow-premium border border-themeBorder border-r-0 rounded-l-xl px-4 py-3 text-themeTextSec flex items-center select-none font-mono">+91</span>
 <input type="text" name="emergencyPhone" required maxLength="10" placeholder="9876543210" value={formData.emergencyPhone} onChange={handleChange} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-r-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent transition font-mono" />
 </div>
 </div>
 </div>`;

code = code.replace(oldFac, newFac);
fs.writeFileSync('Frontend/ERP/components/shared/QuestionnaireModal.jsx', code);
console.log("Patched faculty section");
