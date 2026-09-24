const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/BatchManager.jsx', 'utf8');

// 1. Add state for batchSection
code = code.replace(
    "const [batchStart, setBatchStart] = useState(new Date().getFullYear());",
    "const [batchStart, setBatchStart] = useState(new Date().getFullYear());\n    const [batchSection, setBatchSection] = useState('');"
);

// 2. Update handleCreateBatch
code = code.replace(
    "const autoName = `${prog.code} (Class of ${endYear})`;",
    "const autoName = batchSection ? `${prog.code} (Class of ${endYear}) - Section ${batchSection}` : `${prog.code} (Class of ${endYear})`;"
);

// 3. Clear section on success
code = code.replace(
    "setBatchProgId(''); fetchData();",
    "setBatchProgId(''); setBatchSection(''); fetchData();"
);

// 4. Update the form UI to include the section field
const oldForm = `
                                <label className="text-[10px] font-black text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1.5">Start Year</label>
                                <select required value={batchStart} onChange={e => setBatchStart(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-gray-500 appearance-none">
                                    {[0,1,2,3].map(offset => {
                                        const y = new Date().getFullYear() + offset;
                                        return <option key={y} value={y}>{y}</option>
                                    })}
                                </select>
                            </div>
                        </div>
`;

const newForm = `
                                <label className="text-[10px] font-black text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1.5">Start Year</label>
                                <select required value={batchStart} onChange={e => setBatchStart(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-gray-500 appearance-none">
                                    {[0,1,2,3].map(offset => {
                                        const y = new Date().getFullYear() + offset;
                                        return <option key={y} value={y}>{y}</option>
                                    })}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1.5">Section (Optional)</label>
                                <input type="text" placeholder="e.g. A, 1, Morning" value={batchSection} onChange={e => setBatchSection(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-themeBorder dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-gray-500" />
                            </div>
                        </div>
`;

code = code.replace(oldForm, newForm);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/BatchManager.jsx', code);
console.log("Updated BatchManager.jsx");
