const fs = require('fs');
let file = 'Frontend/ERP/components/Admin/AdminFees/AdminFees.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTabsBlockRegex = /\{\/\* TABS \*\/\}[\s\S]*?<\/div>\s*\{\/\* TAB 1: OVERVIEW \*\/\}/;

const newTabsBlock = `{/* TABS */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 mb-8 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-2 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] w-fit">
          
          {/* Institutional / Student Side */}
          <div className="flex items-center gap-2 pr-4 border-r border-black/10 dark:border-white/10">
            <div className="px-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 block leading-tight">Student</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-themeText dark:text-white block leading-tight">Receivables</span>
            </div>
            {[
                { id: 'overview', label: 'Institutional P&L', icon: 'fa-vault' },
                { id: 'verifications', label: 'Pending Verifications', icon: 'fa-money-check-pen' },
                { id: 'batch', label: 'Batch Manager', icon: 'fa-users-rectangle' },
                { id: 'invoice_history', label: 'Invoice History', icon: 'fa-file-invoice' }
            ].map(tab => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 \${
                    activeTab === tab.id 
                    ? 'bg-amber-500 text-black shadow-lg scale-100' 
                    : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/5 dark:hover:bg-white/5 scale-95 hover:scale-100'
                }\`}
                >
                <i className={\`fa-solid \${tab.icon}\`}></i> {tab.label}
                </button>
            ))}
          </div>

          {/* Faculty / Payroll Side */}
          <div className="flex items-center gap-2 pl-2">
            <div className="px-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 block leading-tight">Faculty</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-themeText dark:text-white block leading-tight">Payables</span>
            </div>
            {[
                { id: 'payroll', label: 'Payroll Automation', icon: 'fa-file-invoice-dollar' }
            ].map(tab => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 \${
                    activeTab === tab.id 
                    ? 'bg-emerald-500 text-black shadow-lg scale-100' 
                    : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-black/5 dark:hover:bg-white/5 scale-95 hover:scale-100'
                }\`}
                >
                <i className={\`fa-solid \${tab.icon}\`}></i> {tab.label}
                </button>
            ))}
          </div>

        </div>

        {/* TAB 1: OVERVIEW */}`;

content = content.replace(oldTabsBlockRegex, newTabsBlock);
fs.writeFileSync(file, content);
