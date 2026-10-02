const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/UserManagement/AdminUserProfileModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetSelect = `.select("status, entry_status")`;
const targetSelect2 = `.select("status")`;

// No changes needed for the query, we already have user object which has the profile data!
// We just need to add the UI block for Admission Details!

const targetUI = ` {/* Basic Info Section */}
 <div>
 <h4 className={\`text-[13px] font-medium text-themeTextSec mb-4 flex items-center gap-2\`}>
 <i className="fa-solid fa-address-card"></i> Core Assignment
 </h4>
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-themeBorder rounded-xl p-4 grid grid-cols-2 gap-4">
 <div>
 <span className={\`text-[12px] font-medium text-themeTextSec block mb-1\`}>
 {user.role === 'student' ? 'Academic Batch' : 'Department'}
 </span>
 <span className="text-[15px] font-semibold text-themeText">
 {user.batch || user.department || 'Not Assigned'}
 </span>
 </div>
 </div>
 </div>`;

const newUI = ` {/* Basic Info Section */}
 <div>
 <h4 className={\`text-[13px] font-medium text-themeTextSec mb-4 flex items-center gap-2\`}>
 <i className="fa-solid fa-address-card"></i> Core Assignment
 </h4>
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-themeBorder rounded-xl p-4 grid grid-cols-2 gap-4">
 <div>
 <span className={\`text-[12px] font-medium text-themeTextSec block mb-1\`}>
 {user.role === 'student' ? 'Academic Batch' : 'Department'}
 </span>
 <span className="text-[15px] font-semibold text-themeText">
 {user.batch || user.department || 'Not Assigned'}
 </span>
 </div>
 </div>
 </div>

 {/* Admission Details (Only for Students) */}
 {user.role === 'student' && (
 <div className="mt-8 animate-fade-in">
 <h4 className={\`text-[13px] font-medium text-themeTextSec mb-4 flex items-center gap-2\`}>
 <i className="fa-solid fa-file-signature"></i> Admissions Registry
 </h4>
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-themeBorder rounded-xl p-5 flex flex-col gap-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-1">
 <span className="text-[11px] font-bold tracking-widest text-themeTextSec uppercase">Application Number</span>
 <span className="text-sm font-mono text-themeText tracking-wider select-all">{user.application_number || 'N/A'}</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-[11px] font-bold tracking-widest text-themeTextSec uppercase">Admission Route</span>
 <span className="text-sm font-semibold text-themeAccent">{user.admission_type || 'N/A'}</span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-[11px] font-bold tracking-widest text-themeTextSec uppercase">Application Date</span>
 <span className="text-sm font-semibold text-themeText">
 {user.application_date ? new Date(user.application_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
 </span>
 </div>
 <div className="flex flex-col gap-1">
 <span className="text-[11px] font-bold tracking-widest text-themeTextSec uppercase">Official Joining Date</span>
 <span className="text-sm font-semibold text-themeText">
 {user.joining_date ? new Date(user.joining_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
 </span>
 </div>
 </div>
 </div>
 </div>
 )}`;

if(content.includes(targetUI)) {
    content = content.replace(targetUI, newUI);
    fs.writeFileSync(file, content);
    console.log('done');
} else {
    console.log('not found');
}
