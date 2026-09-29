const fs = require('fs');
const file = 'Frontend/ERP/components/Student/Assignments/Assignments.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<PageHeader[\s\S]*?<\/button>\s*<\/div>\s*\}\s*\/>/m;

const newHeader = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-indigo-500 shadow-sm">
                <i className="fa-solid fa-file-signature"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Assignment Portal</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Draft & submit coursework</p>
            </div>
        </div>
        
        <div className="flex w-full xl:w-auto border-b xl:border-b-0 xl:bg-black/5 xl:dark:bg-white/5 xl:border border-black/10 dark:border-white/10 xl:rounded-xl overflow-x-auto no-scrollbar gap-2">
            <button type="button"
                onClick={() => setView("pending")}
                className={\`flex-1 xl:flex-none px-6 py-4 xl:py-2.5 rounded-none xl:rounded-lg text-[13px] font-bold tracking-tight transition whitespace-nowrap flex items-center justify-center gap-2 border-b-2 xl:border-b-0 \${view === "pending" ? "text-indigo-600 border-indigo-600 xl:bg-white xl:dark:bg-themeElevated shadow-sm" : "text-themeTextSec border-transparent hover:text-themeText"}\`}
            >
                <span className={\`w-2 h-2 rounded-full \${view === "pending" && pendingAssignments.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-neutral-600'}\`}></span>
                Pending ({pendingAssignments.length})
            </button>
            <button type="button"
                onClick={() => setView("submitted")}
                className={\`flex-1 xl:flex-none px-6 py-4 xl:py-2.5 rounded-none xl:rounded-lg text-[13px] font-bold tracking-tight transition whitespace-nowrap flex items-center justify-center gap-2 border-b-2 xl:border-b-0 \${view === "submitted" ? "text-indigo-600 border-indigo-600 xl:bg-white xl:dark:bg-themeElevated shadow-sm" : "text-themeTextSec border-transparent hover:text-themeText"}\`}
            >
                <i className="fa-solid fa-check-circle"></i>
                Submitted
            </button>
            <button type="button"
                onClick={() => setView("graded")}
                className={\`flex-1 xl:flex-none px-6 py-4 xl:py-2.5 rounded-none xl:rounded-lg text-[13px] font-bold tracking-tight transition whitespace-nowrap flex items-center justify-center gap-2 border-b-2 xl:border-b-0 \${view === "graded" ? "text-indigo-600 border-indigo-600 xl:bg-white xl:dark:bg-themeElevated shadow-sm" : "text-themeTextSec border-transparent hover:text-themeText"}\`}
            >
                <i className="fa-solid fa-star"></i>
                Graded
            </button>
        </div>
    </div>
</div>`;

content = content.replace(regex, newHeader);

// Fix wrapper to allow edge-to-edge
content = content.replace(/<div className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-8 lg:gap-12 \$\{\!isEmbedded \? "p-4 sm:p-6 lg:p-10 pb-10 lg:pb-10 xl:pb-8" : "pb-10"\}`\}>/, '<div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>');

// Inject padding into content below
content = content.replace(/\{view === "pending" && \(/, '<div className={`flex flex-col p-4 sm:p-6 lg:p-10 gap-8 lg:gap-12 ${isEmbedded ? "p-0" : ""}`}>\n{view === "pending" && (');

// Close wrapper at the end
content = content.replace(/\{view === "graded" && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/, (match) => match.replace('</div>\n        </div>', '</div>\n</div>\n        </div>'));

fs.writeFileSync(file, content);
