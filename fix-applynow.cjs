const fs = require('fs');
const file = 'Frontend/Website/components/NAVBAR/APPLY_NOW/ApplyNow.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add admissionType to formData state
content = content.replace(
  /const \[formData, setFormData\] = useState\(\{([^}]*)\}\);/,
  (match, p1) => {
    return `const [formData, setFormData] = useState({${p1}, admissionType: 'Management Quota'});`;
  }
);

// 2. Add admission_type to the insert payload
content = content.replace(
  /status: 'pending', source: 'website'/g,
  `status: 'pending', source: 'website', admission_type: isSpotAdmissionsOpen ? 'Spot Admissions' : formData.admissionType`
);

// 3. Add the UI dropdown for admissionType in Section 1
const section1End = `                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                    className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all" placeholder="Your phone number" />
                            </div>`;

const newField = `                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 ml-1">Admission Route</label>
                                {isSpotAdmissionsOpen ? (
                                    <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 text-amber-500 font-black tracking-widest uppercase text-sm">
                                        🚨 Spot Admissions Active
                                    </div>
                                ) : (
                                    <select name="admissionType" value={formData.admissionType} onChange={handleChange}
                                        className="w-full bg-[var(--card-bg)]/50 border border-[var(--card-border)] rounded-2xl px-5 py-4 text-base text-[var(--text-color)] focus:border-[var(--primary-color)]/50 outline-none transition-all appearance-none cursor-pointer">
                                        <option value="Management Quota">Management Quota</option>
                                        <option value="Counseling Phase">Counseling Phase</option>
                                        <option value="Transfer">Transfer / Migration</option>
                                    </select>
                                )}
                            </div>`;

content = content.replace(section1End, newField);

fs.writeFileSync(file, content);
console.log('done');
