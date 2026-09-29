const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHeaderRegex = /\{\!subjectContext && \([\s\S]*?<\/div>\s*\)\}/;

const newHeader = `{!subjectContext && (
    <div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-themeAccent/5 via-transparent to-transparent py-8 shrink-0">
        <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-themeAccent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-themeAccent shadow-sm">
                    <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Assignment Engine</h1>
                    <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Manage offline submissions</p>
                </div>
            </div>
            <button type="button" 
                onClick={() => setShowForm(!showForm)}
                className={\`px-6 py-3 rounded-xl text-white text-[13px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 \${showForm ? 'bg-neutral-600 hover:bg-neutral-700 shadow-neutral-600/20' : 'bg-themeAccent hover:bg-themeAccent/90 shadow-themeAccent/20'}\`}
            >
                <i className={\`fa-solid \${showForm ? 'fa-xmark' : 'fa-plus'}\`}></i> 
                {showForm ? 'Cancel Creation' : 'New Assignment'}
            </button>
        </div>
    </div>
)}`;

content = content.replace(oldHeaderRegex, newHeader);

// Fix wrapper to allow edge-to-edge
content = content.replace(/<div className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 \$\{\!isEmbedded \? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"\}`\}>/, '<div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>');

// We need to inject the padding into the content BELOW the new banner.
content = content.replace(/\{showForm && \(/, '<div className={`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 ${isEmbedded ? "p-0" : ""}`}>\n{showForm && (');

// Close the wrapper
content = content.replace(/\{assignments\.length === 0 && !showForm && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/, (match) => match.replace('</div>\n        </div>', '</div>\n</div>\n        </div>'));

fs.writeFileSync(file, content);
