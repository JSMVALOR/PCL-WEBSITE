const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/shared/QuestionnaireModal.jsx', 'utf8');

// Add parentEmail to state
code = code.replace("parentOccupation: '',", "parentOccupation: '',\n parentEmail: '',");

// Replace JSX
const oldJsx = `<div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Primary Parent/Guardian Occupation *</label>
 <input type="text" name="parentOccupation" required placeholder="e.g. Business, Government Service, Doctor" value={formData.parentOccupation} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
 </div>`;

const newJsx = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Primary Parent/Guardian Occupation *</label>
 <input type="text" name="parentOccupation" required placeholder="e.g. Business, Government Service, Doctor" value={formData.parentOccupation} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Parent/Guardian Email ID *</label>
 <input type="email" name="parentEmail" required placeholder="Parent's active email address" value={formData.parentEmail} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
 </div>
 </div>`;

code = code.replace(oldJsx, newJsx);
fs.writeFileSync('Frontend/ERP/components/shared/QuestionnaireModal.jsx', code);
console.log("Patched QuestionnaireModal with parentEmail");
