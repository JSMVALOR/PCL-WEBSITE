const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx', 'utf8');

const tableRegex = /<div className="overflow-x-auto">[\s\S]*?<\/table>\n\s*<\/div>/;

const newLayout = `
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full text-left">
    <thead className="bg-themeApp dark:bg-themeApp backdrop-blur-2xl border-b-theme border-themeBorder text-xs tracking-normal text-themeTextSec font-black">
      <tr>
        <th className="p-4 border-r-theme border-themeBorder">Applicant</th>
        <th className="p-4 border-r-theme border-themeBorder">Program</th>
        <th className="p-4 border-r-theme border-themeBorder">Marks / Exams</th>
        <th className="p-4 border-r-theme border-themeBorder">Date</th>
        <th className="p-4 border-r-theme border-themeBorder">Status</th>
        <th className="p-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-themeBorder">
      {filteredApps.length === 0 ? (
        <tr><td colSpan="6" className="p-8 text-center text-themeTextSec font-black tracking-normal">No applications found.</td></tr>
      ) : (
        filteredApps.map(app => (
          <tr key={app.id} className="hover:bg-themeApp dark:bg-themeApp backdrop-blur-2xl transition-colors group">
            <td className="p-4 border-r-theme border-themeBorder">
              <p className="font-black text-themeText">{app.name}</p>
              <p className="text-xs text-themeTextSec font-medium mt-1">{app.email}</p>
              <p className="text-xs text-themeTextSec font-medium mt-0.5">{app.phone}</p>
            </td>
            <td className="p-4 text-[15px] font-semibold text-themeText border-r-theme border-themeBorder">{app.program}</td>
            <td className="p-4 border-r-theme border-themeBorder">
              <p className="text-xs text-themeText font-black tracking-normal mb-1">
                10th: <span className="text-indigo-400">{app.marks_10th}</span> | 12th: <span className="text-emerald-400">{app.marks_inter}</span>
              </p>
              {app.exam_tglawcet && <p className="text-xs text-themeText font-black tracking-normal">TGLAWCET: <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{app.exam_tglawcet}</span></p>}
              {app.exam_clat && <p className="text-xs text-themeText font-black tracking-normal mt-1">CLAT: <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{app.exam_clat}</span></p>}
            </td>
            <td className="p-4 text-xs text-themeTextSec font-medium border-r-theme border-themeBorder">
              {new Date(app.created_at).toLocaleDateString()}
            </td>
            <td className="p-4 border-r-theme border-themeBorder">
              <span className={\`px-2.5 py-1 rounded-md text-[13px] font-medium border border-themeBorder inline-block mb-2 \${
                app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }\`}>
                {app.status}
              </span>
              {app.erp_id && <p className="text-[13px] font-medium text-themeTextSec">ID: <span className="text-themeText select-all">{app.erp_id}</span></p>}
            </td>
            <td className="p-4 text-right space-x-2">
              {app.status === 'pending' && (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => handleApprovePipeline(app)} className="w-8 h-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeText rounded-lg transition" title="Approve">
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button type="button" onClick={() => handleReject(app)} className="w-8 h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText rounded-lg transition" title="Reject">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

<div className="lg:hidden flex flex-col divide-y divide-themeBorder">
  {filteredApps.length === 0 ? (
    <div className="p-8 text-center text-themeTextSec font-black tracking-normal">No applications found.</div>
  ) : (
    filteredApps.map(app => (
      <div key={app.id} className="p-4 flex flex-col gap-3 hover:bg-themeApp dark:bg-themeApp transition-colors group relative">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-black text-themeText text-lg">{app.name}</h4>
            <p className="text-sm font-semibold text-themeAccent mt-0.5">{app.program}</p>
          </div>
          <span className={\`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-themeBorder \${
            app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
            app.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
            'bg-amber-500/10 text-amber-500'
          }\`}>
            {app.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-themeTextSec font-bold mb-1"><i className="fa-solid fa-envelope mr-1.5"></i>{app.email}</p>
            <p className="text-themeTextSec font-bold"><i className="fa-solid fa-phone mr-1.5"></i>{app.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-themeTextSec font-bold mb-1">{new Date(app.created_at).toLocaleDateString()}</p>
            {app.erp_id && <p className="text-themeText font-black tracking-normal">ID: {app.erp_id}</p>}
          </div>
        </div>
        
        <div className="bg-themeElevated rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-black tracking-normal">
          <p>10th: <span className="text-indigo-500">{app.marks_10th}</span></p>
          <p>12th: <span className="text-emerald-500">{app.marks_inter}</span></p>
          {app.exam_tglawcet && <p>TGLAWCET: <span className="text-amber-500">{app.exam_tglawcet}</span></p>}
          {app.exam_clat && <p>CLAT: <span className="text-emerald-500">{app.exam_clat}</span></p>}
        </div>
        
        {app.status === 'pending' && (
          <div className="flex justify-end gap-2 mt-1">
            <button type="button" onClick={() => handleApprovePipeline(app)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeApp font-black tracking-wide rounded-xl transition">
              <i className="fa-solid fa-check mr-2"></i> Approve
            </button>
            <button type="button" onClick={() => handleReject(app)} className="flex-1 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeApp font-black tracking-wide rounded-xl transition">
              <i className="fa-solid fa-xmark mr-2"></i> Reject
            </button>
          </div>
        )}
      </div>
    ))
  )}
</div>
`;

file = file.replace(tableRegex, newLayout);
fs.writeFileSync('Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx', file);
