const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx', 'utf8');

const regex = /<div className="overflow-x-auto">[\s\S]*?<\/table>\s*<\/div>/;

const newLayout = `
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-themeBorder bg-themeElevated/50">
        <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Code</th>
        <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Subject Name</th>
        <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Credits</th>
        <th className="py-4 px-6 text-[10px] font-black text-themeTextSec uppercase tracking-widest">Assigned Faculty</th>
      </tr>
    </thead>
    <tbody>
      {masterSubjects.length === 0 ? (
        <tr>
          <td colSpan="4" className="py-12 text-center">
            <p className="text-sm font-bold text-themeTextSec">No subjects found in the Curriculum Vault for this program's current semester.</p>
          </td>
        </tr>
      ) : masterSubjects.map(master => {
        const activeAssig = cohortSubjects.find(c => c.master_subject_id === master.id);
        const currentFaculty = activeAssig ? (activeAssig.faculty_id || '') : '';
        
        return (
          <tr key={master.id} className="border-b border-themeBorder hover:bg-themeElevated/50 transition">
            <td className="py-4 px-6 text-sm font-black text-themeText">{master.code}</td>
            <td className="py-4 px-6 text-sm font-bold text-themeTextSec dark:text-gray-300">{master.name}</td>
            <td className="py-4 px-6 text-sm font-bold text-themeTextSec">{master.credits}</td>
            <td className="py-4 px-6">
              <select 
                value={currentFaculty} 
                onChange={e => handleAssign(master.id, e.target.value)}
                className={\`w-full max-w-[250px] border rounded-lg px-3 py-2 text-sm font-bold outline-none appearance-none transition \${currentFaculty ? 'bg-themeAccent/10 border-themeAccent/20 text-themeAccent' : 'bg-themeElevated border-themeBorder text-themeText'}\`}
              >
                <option value="">Unassigned</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
              </select>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

<div className="lg:hidden flex flex-col divide-y divide-themeBorder">
  {masterSubjects.length === 0 ? (
    <div className="py-12 px-6 text-center">
      <p className="text-sm font-bold text-themeTextSec">No subjects found in the Curriculum Vault for this program's current semester.</p>
    </div>
  ) : (
    masterSubjects.map(master => {
      const activeAssig = cohortSubjects.find(c => c.master_subject_id === master.id);
      const currentFaculty = activeAssig ? (activeAssig.faculty_id || '') : '';
      
      return (
        <div key={master.id} className="p-4 flex flex-col gap-3 hover:bg-themeElevated/50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <span className="text-[10px] font-black tracking-widest text-themeAccent uppercase bg-themeAccent/10 px-2 py-0.5 rounded-sm mb-1 inline-block">{master.code}</span>
              <h4 className="text-[15px] font-bold text-themeText leading-snug mt-1 pr-2">{master.name}</h4>
            </div>
            <div className="shrink-0 flex flex-col items-center bg-themeElevated border border-themeBorder rounded-lg p-2 min-w-[50px]">
              <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Credits</span>
              <span className="text-lg font-black text-themeText">{master.credits}</span>
            </div>
          </div>
          
          <div className="mt-2 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest pl-1">Assigned Faculty</label>
            <div className="relative">
              <select 
                value={currentFaculty} 
                onChange={e => handleAssign(master.id, e.target.value)}
                className={\`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none transition \${currentFaculty ? 'bg-themeAccent/10 border-themeAccent/20 text-themeAccent' : 'bg-themeElevated border-themeBorder text-themeText'}\`}
              >
                <option value="">Unassigned</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
              </select>
              <i className={\`fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none \${currentFaculty ? 'text-themeAccent' : 'text-themeTextSec'}\`}></i>
            </div>
          </div>
        </div>
      );
    })
  )}
</div>
`;

file = file.replace(regex, newLayout);
fs.writeFileSync('Frontend/ERP/components/Admin/AdminTimetableBuilder/tabs/FacultyAllocator.jsx', file);
