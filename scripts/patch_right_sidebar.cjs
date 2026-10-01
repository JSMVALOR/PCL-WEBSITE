const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx';
let content = fs.readFileSync(file, 'utf8');

const whatsappCard = `
            {/* WhatsApp Engine Card */}
            <div className="bg-themePanel/85 backdrop-blur-2xl p-5 rounded-2xl border border-themeBorder dark:border-white/5 shadow-sm hover:border-green-500/50 transition-colors group">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2 group-hover:text-green-500 transition-colors">
                        <i className="fa-brands fa-whatsapp text-green-500 text-sm"></i> WhatsApp Engine
                    </h3>
                </div>
                <p className="text-xs text-themeTextSec mb-4">Autonomous background messaging worker</p>
                <button type="button" onClick={() => window.location.hash = '#whatsapp'} className="w-full py-2 bg-black/5 dark:bg-white/5 hover:bg-green-500/10 text-themeText hover:text-green-600 dark:hover:text-green-400 border border-themeBorder dark:border-white/5 hover:border-green-500/30 rounded-xl text-xs font-bold transition-all">
                    Configure Service
                </button>
            </div>
`;

// Insert the card before the System Backup card or just before the final closing divs
content = content.replace(
    /\{?\/\* Admin Actions \*\/\}/,
    `{/* Admin Actions */}${whatsappCard}`
);

fs.writeFileSync(file, content);
