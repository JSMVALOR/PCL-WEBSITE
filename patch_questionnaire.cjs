const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/shared/QuestionnaireModal.jsx', 'utf8');

// Add to state
code = code.replace("emergencyRelation: '',", "emergencyRelation: '',\n emergencyDesignation: '',");

// Add to finalData
code = code.replace("emergencyRelation: formData.emergencyRelation", "emergencyRelation: formData.emergencyRelation,\n emergencyDesignation: formData.emergencyDesignation");

// Replace JSX
const oldJsx = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Emergency Contact Name *</label>
 <input type="text" name="emergencyContact" required placeholder="e.g. John Doe (Father)" value={formData.emergencyContact} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
 </div>
 
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Emergency Contact Phone *</label>
 <div className="flex">
 <span className="bg-themeElevated backdrop-blur-[80px] backdrop-blur-2xl shadow-premium border border-themeBorder border-r-0 rounded-l-themeBtn px-4 py-3 text-themeTextSec flex items-center select-none font-mono">+91</span>
 <input type="text" name="emergencyPhone" required maxLength="10" placeholder="9876543210" value={formData.emergencyPhone} onChange={handleChange} className="w-full bg-themeApp border border-themeBorder rounded-r-themeBtn px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none font-mono" />
 </div>
 </div>
 </div>`;

const newJsx = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Emergency Contact Relation *</label>
 <select name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none">
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
 <label className="text-sm font-semibold text-themeText">Emergency Contact Name *</label>
 <input type="text" name="emergencyContact" required placeholder="Full Name" value={formData.emergencyContact} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Designation / Occupation *</label>
 <input type="text" name="emergencyDesignation" required placeholder="e.g. Business, Doctor, Retired" value={formData.emergencyDesignation} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-themePanel/[0.04] border border-themeBorder dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-sm font-semibold text-themeText">Emergency Contact Phone *</label>
 <div className="flex">
 <span className="bg-themeElevated backdrop-blur-[80px] backdrop-blur-2xl shadow-premium border border-themeBorder border-r-0 rounded-l-themeBtn px-4 py-3 text-themeTextSec flex items-center select-none font-mono">+91</span>
 <input type="text" name="emergencyPhone" required maxLength="10" placeholder="9876543210" value={formData.emergencyPhone} onChange={handleChange} className="w-full bg-themeApp border border-themeBorder rounded-r-themeBtn px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none font-mono" />
 </div>
 </div>
 </div>`;

code = code.replace(oldJsx, newJsx);
fs.writeFileSync('Frontend/ERP/components/shared/QuestionnaireModal.jsx', code);
console.log("Patched QuestionnaireModal");
