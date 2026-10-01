const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx', 'utf8');

const regex = /<div className="overflow-x-auto">[\s\S]*?<\/table>\s*<\/div>/;

const newLayout = `
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="bg-themeElevated dark:bg-themeElevated/90 backdrop-blur-md border-b border-themeBorder">
        <th className="p-4 text-[13px] font-medium text-themeTextSec">Title</th>
        <th className="p-4 text-[13px] font-medium text-themeTextSec">Department</th>
        <th className="p-4 text-[13px] font-medium text-themeTextSec">Type</th>
        <th className="p-4 text-[13px] font-medium text-themeTextSec">Status</th>
        <th className="p-4 text-[13px] font-medium text-themeTextSec text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan="5" className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
            <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Jobs...
          </td>
        </tr>
      ) : jobs.length === 0 ? (
        <tr>
          <td colSpan="5" className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
            No jobs posted yet.
          </td>
        </tr>
      ) : (
        jobs.map((job) => (
          <tr key={job.id} className="border-b border-themeBorder hover:bg-themeElevated/50 transition-colors">
            <td className="p-4 text-sm font-bold text-themeText">{job.title}</td>
            <td className="p-4 text-xs font-bold text-themeTextSec">{job.department}</td>
            <td className="p-4 text-xs font-bold text-themeTextSec">{job.job_type} / {job.location}</td>
            <td className="p-4">
              {job.status === 'Active' ? (
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[12px] font-medium rounded whitespace-nowrap">Active</span>
              ) : (
                <span className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px] font-medium rounded whitespace-nowrap">Inactive</span>
              )}
            </td>
            <td className="p-4 text-right">
              <button type="button" onClick={() => handleEdit(job)} className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-themeApp text-blue-500 border border-blue-500/20 flex flex-col items-center justify-center transition-colors float-right">
                <i className="fa-solid fa-pen"></i>
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

<div className="lg:hidden flex flex-col divide-y divide-themeBorder">
  {isLoading ? (
    <div className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Jobs...
    </div>
  ) : jobs.length === 0 ? (
    <div className="p-8 text-center text-[15px] font-semibold text-themeTextSec tracking-normal">
      No jobs posted yet.
    </div>
  ) : (
    jobs.map((job) => (
      <div key={job.id} className="p-4 flex flex-col gap-3 hover:bg-themeElevated/50 transition-colors">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h4 className="font-bold text-themeText text-lg leading-tight">{job.title}</h4>
            <p className="text-xs font-bold text-themeTextSec mt-1">{job.department}</p>
          </div>
          <span className={\`px-2 py-1 text-[11px] font-bold rounded shrink-0 \${
            job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }\`}>
            {job.status}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-bold text-themeTextSec bg-themeElevated/50 p-2.5 rounded-lg border border-themeBorder/50">
          <div className="flex items-center gap-1.5"><i className="fa-solid fa-briefcase"></i> {job.job_type}</div>
          <div className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {job.location}</div>
        </div>
        
        <div className="flex justify-end mt-1">
          <button type="button" onClick={() => handleEdit(job)} className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-themeApp text-blue-500 font-black text-[13px] tracking-wide transition-colors flex items-center justify-center gap-2">
            <i className="fa-solid fa-pen-to-square"></i> Edit Job
          </button>
        </div>
      </div>
    ))
  )}
</div>
`;

file = file.replace(regex, newLayout);
fs.writeFileSync('Frontend/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx', file);
