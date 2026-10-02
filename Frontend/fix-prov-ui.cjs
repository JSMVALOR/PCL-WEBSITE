const fs = require('fs');
const file = 'ERP/components/Admin/UserManagement/UserProvisioningHub.jsx';
let content = fs.readFileSync(file, 'utf8');

// Single mode UI
const oldSingle = ` <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">WhatsApp Number</label>
 <input type="text" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="+91..." />
 </div>
 </div>`;

const newSingle = ` <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">WhatsApp Number</label>
 <input type="text" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="+91..." />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Joining Date</label>
 <input type="date" value={newUserJoiningDate} onChange={(e) => setNewUserJoiningDate(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Admission Type / Wave</label>
 <input type="text" value={newUserAdmissionType} onChange={(e) => setNewUserAdmissionType(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="e.g. Regular, Management Quota" />
 </div>
 </div>`;

content = content.replace(oldSingle, newSingle);

// Bulk mode UI
const oldBulkHeader = ` <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-widest text-themeTextSec px-2">
 <div className="col-span-3">Full Name</div>
 <div className="col-span-3">Batch/Dept</div>
 <div className="col-span-3">Email</div>
 <div className="col-span-2">WhatsApp</div>
 <div className="col-span-1"></div>
 </div>`;

const newBulkHeader = ` <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-widest text-themeTextSec px-2">
 <div className="col-span-2">Name</div>
 <div className="col-span-2">Batch</div>
 <div className="col-span-2">Email</div>
 <div className="col-span-2">WhatsApp</div>
 <div className="col-span-2">Join Date</div>
 <div className="col-span-1">Type</div>
 <div className="col-span-1"></div>
 </div>`;

content = content.replace(oldBulkHeader, newBulkHeader);

const oldBulkRow = `  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
  <input type="text" value={row.name} onChange={(e) => updateBulkRow(idx, 'name', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 0)} placeholder="Name" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.batch} onChange={(e) => updateBulkRow(idx, 'batch', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 1)} placeholder="Default" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" title="Leave blank to use the dropdown assignment" />
  <input type="email" value={row.email} onChange={(e) => updateBulkRow(idx, 'email', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 2)} placeholder="Email" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.phone} onChange={(e) => updateBulkRow(idx, 'phone', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 3)} placeholder="+91..." className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <button type="button" onClick={() => removeBulkRow(idx)} className="col-span-1 text-themeTextSec hover:text-rose-500 transition text-sm flex justify-center"><i className="fa-solid fa-xmark"></i></button>
  </div>`;

const newBulkRow = `  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
  <input type="text" value={row.name} onChange={(e) => updateBulkRow(idx, 'name', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 0)} placeholder="Name" className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.batch} onChange={(e) => updateBulkRow(idx, 'batch', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 1)} placeholder="Default" className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" title="Leave blank to use the dropdown assignment" />
  <input type="email" value={row.email} onChange={(e) => updateBulkRow(idx, 'email', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 2)} placeholder="Email" className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.phone} onChange={(e) => updateBulkRow(idx, 'phone', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 3)} placeholder="+91..." className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="date" value={row.joinDate} onChange={(e) => updateBulkRow(idx, 'joinDate', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 4)} className="col-span-2 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <input type="text" value={row.admType} onChange={(e) => updateBulkRow(idx, 'admType', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 5)} placeholder="Type" className="col-span-1 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
  <button type="button" onClick={() => removeBulkRow(idx)} className="col-span-1 text-themeTextSec hover:text-rose-500 transition text-sm flex justify-center"><i className="fa-solid fa-xmark"></i></button>
  </div>`;

content = content.replace(oldBulkRow, newBulkRow);

fs.writeFileSync(file, content);
console.log('done');
