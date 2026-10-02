const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

// Inject framer-motion import if not present
if (!content.includes('import { motion, AnimatePresence } from "framer-motion"')) {
  content = content.replace('import React', 'import { motion, AnimatePresence } from "framer-motion";\nimport React');
}

const targetRender = ` {isLoading ? (
 <div className="flex justify-center p-12">
 <div className="animate-spin w-8 h-8 border-4 border-themeBorder Accent border-t-transparent rounded-full"></div>
 </div>
 ) : (
 <div className="bg-themePanel shadow-sm rounded-2xl border border-themeBorder overflow-hidden">
 
<div className="hidden lg:block overflow-x-auto">`;

const oldUIEnd = ` </div>
    ))
  )}
</div>

 </div>
 )}`;

const newRender = ` {isLoading ? (
 <div className="flex justify-center p-20">
 <div className="animate-spin w-10 h-10 border-4 border-themeAccent/20 border-t-themeAccent rounded-full"></div>
 </div>
 ) : (
 <div className="w-full">
 {filteredApps.length === 0 ? (
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4 bg-themePanel/50 backdrop-blur-3xl border border-themeBorder rounded-3xl shadow-xl">
 <div className="w-20 h-20 rounded-full bg-themeAccent/5 flex items-center justify-center mb-4">
 <i className="fa-solid fa-inbox text-3xl text-themeAccent/40"></i>
 </div>
 <h3 className="text-xl font-black text-themeText tracking-tight mb-2">No Applications Found</h3>
 <p className="text-sm font-medium text-themeTextSec">Waiting for new candidates to apply.</p>
 </motion.div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
 <AnimatePresence mode="popLayout">
 {filteredApps.map((app, idx) => (
 <motion.div 
 layout
 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
 animate={{ opacity: 1, scale: 1, y: 0 }} 
 exit={{ opacity: 0, scale: 0.9, y: -20 }}
 transition={{ duration: 0.4, delay: idx * 0.05, type: "spring", bounce: 0.3 }}
 key={app.id} 
 className="group relative bg-themePanel/80 hover:bg-themeApp backdrop-blur-2xl border border-themeBorder/60 hover:border-themeAccent/30 rounded-3xl p-6 shadow-lg hover:shadow-2xl hover:shadow-themeAccent/10 transition-all duration-500 flex flex-col"
 >
 {/* Status Badge absolute top right */}
 <div className="absolute top-6 right-6">
 <span className={\`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border \${
 app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' :
 app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]' :
 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
 }\`}>
 {app.status}
 </span>
 </div>
 
 <div className="flex flex-col mb-6 pr-24">
 <h4 className="font-black text-themeText text-xl tracking-tight mb-1 group-hover:text-themeAccent transition-colors">{app.name}</h4>
 <p className="text-sm font-bold text-themeAccent/80">{app.program}</p>
 </div>
 
 <div className="flex flex-col gap-2 mb-6">
 <div className="flex items-center gap-3 text-[13px] font-medium text-themeTextSec">
 <div className="w-8 h-8 rounded-full bg-themeApp border border-themeBorder flex items-center justify-center shrink-0 group-hover:border-themeAccent/30 transition-colors">
 <i className="fa-solid fa-envelope text-themeText/60 group-hover:text-themeAccent transition-colors"></i>
 </div>
 <span className="truncate">{app.email}</span>
 </div>
 <div className="flex items-center gap-3 text-[13px] font-medium text-themeTextSec">
 <div className="w-8 h-8 rounded-full bg-themeApp border border-themeBorder flex items-center justify-center shrink-0 group-hover:border-themeAccent/30 transition-colors">
 <i className="fa-solid fa-phone text-themeText/60 group-hover:text-themeAccent transition-colors"></i>
 </div>
 <span>{app.phone}</span>
 </div>
 </div>
 
 <div className="bg-themeApp/50 rounded-2xl p-4 border border-themeBorder/40 flex flex-wrap gap-x-6 gap-y-3 mb-6 flex-1">
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec/70 mb-1">10th Marks</span>
 <span className="font-black text-themeText text-sm">{app.marks_10th}</span>
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec/70 mb-1">12th Marks</span>
 <span className="font-black text-themeText text-sm">{app.marks_inter}</span>
 </div>
 {app.exam_tglawcet && (
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500/70 mb-1">TGLAWCET</span>
 <span className="font-black text-amber-400 text-sm">{app.exam_tglawcet}</span>
 </div>
 )}
 {app.exam_clat && (
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/70 mb-1">CLAT</span>
 <span className="font-black text-emerald-400 text-sm">{app.exam_clat}</span>
 </div>
 )}
 </div>
 
 <div className="flex items-center justify-between mt-auto pt-2">
 <div className="flex flex-col">
 <span className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec mb-0.5">Applied On</span>
 <span className="font-semibold text-xs text-themeText">{new Date(app.created_at).toLocaleDateString()}</span>
 </div>
 
 {app.erp_id ? (
 <div className="flex flex-col items-end">
 <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-0.5">ERP ID Assigned</span>
 <span className="font-black text-xs text-themeText bg-themeApp px-2 py-1 rounded-md border border-themeBorder select-all">{app.erp_id}</span>
 </div>
 ) : app.status === 'pending' ? (
 <div className="flex gap-2">
 <button type="button" onClick={() => handleApprovePipeline(app)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-themeApp hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300" title="Approve">
 <i className="fa-solid fa-check text-lg"></i>
 </button>
 <button type="button" onClick={() => handleReject(app)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeApp hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all duration-300" title="Reject">
 <i className="fa-solid fa-xmark text-lg"></i>
 </button>
 </div>
 ) : null}
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}
 </div>
 )}`;

const startIndex = content.indexOf('{isLoading ? (');
const endIndex = content.indexOf(' </div>\n )}\n\n {/* Automation Pipeline Modal */}');
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newRender + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log('done');
} else {
  console.log('Indexes not found!');
}
