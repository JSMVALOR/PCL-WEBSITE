const fs = require('fs');
const file = 'Frontend/ERP/components/shared/UpdatesCarousel/UpdatesCarousel.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div key="notices" className="w-full h-full shrink-0 flex flex-col bg-transparent p-6 relative">
            <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                <h3 className="text-[13px] font-medium tracking-normal text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-bullhorn"></i> Campus Notices
                </h3>
                {onNoticesClick && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onNoticesClick} className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-themeAccent border border-black/5 dark:border-white/5">
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                    </motion.button>
                )}
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                {notices.length > 0 ? notices.map((n, i) => (
                    <motion.div 
                        whileHover={{ x: 4 }}
                        key={i} 
                        className="p-4 bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl cursor-pointer group hover:bg-black/5 dark:hover:bg-white/15 transition-colors shrink-0 relative z-10" 
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className={\`text-[11px] font-medium px-2 py-0.5 rounded-full \${n.priority === 'CRITICAL' || n.priority === 'URGENT' ? 'bg-rose-500 text-themeText dark:text-white' : n.priority === 'IMPORTANT' ? 'bg-amber-500 text-themeText dark:text-white' : 'bg-themeElevated text-themeTextSec border border-black/5 dark:border-white/5'}\`}>{n.priority || 'UPDATE'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-themeText mb-1 line-clamp-1">{n.title}</h4>
                        <p className="text-xs text-themeTextSec line-clamp-2">{n.content}</p>
                    </motion.div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50 relative z-10">
                        <i className="fa-regular fa-bell-slash text-2xl mb-2 text-themeTextSec"></i>
                        <p className="text-xs font-medium text-themeTextSec">No new notices</p>
                    </div>
                )}
            </div>
        </div>`;

const replacement = `<div key="notices" className="w-full h-full shrink-0 flex flex-col bg-transparent py-4 relative">
            <div className="flex justify-between items-center mb-5 shrink-0 relative z-10 border-b border-black/[0.04] dark:border-white/[0.04] pb-3">
                <h3 className="text-sm font-black tracking-tight text-themeText uppercase flex items-center gap-2">
                    <i className="fa-solid fa-bullhorn text-themeAccent"></i> Campus Notices
                </h3>
                {onNoticesClick && (
                    <button type="button" onClick={onNoticesClick} className="text-themeAccent text-xs hover:underline font-bold">
                        View All
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
                {notices.length > 0 ? notices.map((n, i) => (
                    <div 
                        key={i} 
                        className="pb-3 border-b border-black/[0.02] dark:border-white/[0.02] cursor-pointer hover:opacity-80 transition-opacity shrink-0 relative z-10" 
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={\`text-[9px] font-black uppercase tracking-widest \${n.priority === 'CRITICAL' || n.priority === 'URGENT' ? 'text-rose-500' : n.priority === 'IMPORTANT' ? 'text-amber-500' : 'text-themeTextSec'}\`}>{n.priority || 'UPDATE'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-themeText mb-1 line-clamp-1">{n.title}</h4>
                        <p className="text-xs text-themeTextSec line-clamp-2">{n.content}</p>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center p-8 opacity-50 bg-black/5 dark:bg-white/5 rounded-2xl relative z-10">
                        <i className="fa-regular fa-bell-slash text-2xl mb-2 text-themeTextSec"></i>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">No new notices</p>
                    </div>
                )}
            </div>
        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
