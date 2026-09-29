const fs = require('fs');
const file = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /<div className=\{`flex flex-wrap lg:flex-nowrap p-1\.5 bg-white\/80 dark:bg-themePanel\/80 backdrop-blur-3xl saturate-\[1\.8\] shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\] dark:shadow-\[0_8px_30px_rgb\(0,0,0,0\.2\)\] rounded-2xl border border-black\/\[0\.04\] dark:border-white\/\[0\.08\] relative z-10 gap-1\.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premium`\}>[\s\S]*?<\/div>/;

const replacement = `<div className="flex w-full border-b border-black/[0.04] dark:border-white/[0.08] relative z-10 overflow-x-auto no-scrollbar mb-4 gap-6">
 <button type="button" onClick={() => setActiveTab('broadcast')} className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'broadcast' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}>
 <i className="fa-solid fa-satellite-dish"></i> Notices
 </button>
 <button type="button" onClick={() => setActiveTab('events')} className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'events' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}>
 <i className="fa-solid fa-calendar-day"></i> Events
 </button>
 <button type="button" onClick={() => setActiveTab('grid')} className={\`py-4 text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap flex items-center gap-2 border-b-2 \${activeTab === 'grid' ? 'text-themeAccent border-themeAccent' : 'text-themeTextSec border-transparent hover:text-themeText'}\`}>
 <i className="fa-solid fa-table-cells"></i> Calendar Grid
 </button>
 </div>`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(file, content);
