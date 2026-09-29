const fs = require('fs');
const file = 'Frontend/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<PageHeader[\s\S]*?\/>/;

const newHeader = `<div className="relative w-full overflow-hidden border-b border-black/[0.04] dark:border-white/[0.04] bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent py-8 shrink-0">
    <div className="absolute top-0 right-0 w-full max-w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-themePanel/50 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl text-emerald-500 shadow-sm">
                <i className="fa-solid fa-file-pen"></i>
            </div>
            <div>
                <h1 className="text-3xl font-black text-themeText tracking-tight mb-1">Marks & Assignments</h1>
                <p className="text-[13px] font-bold text-themeTextSec uppercase tracking-widest">Grade active assignments & internal marks</p>
            </div>
        </div>
    </div>
</div>`;

content = content.replace(regex, newHeader);

// Fix wrapper to allow edge-to-edge
content = content.replace(/<div className=\{`w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 \$\{\!isEmbedded \? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"\}`\}>/, '<div className={`w-full max-w-[1800px] mx-auto flex flex-col pb-10 lg:pb-10 xl:pb-8`}>');

// Inject padding into content below
content = content.replace(/\{students\.length > 0 && selectedAssessmentType && \(/, '<div className={`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 ${isEmbedded ? "p-0" : ""}`}>\n{students.length > 0 && selectedAssessmentType && (');

// And if it's the empty state: {students.length === 0 && ( ... )}
// Wait, the `{students.length > 0 && selectedAssessmentType && (` is the first element after the header.
// I can just wrap everything after the header in a div!
// Let's do that differently: find the end of the new header and insert `<div className="flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8">`.

content = content.replace(/\{!subjectContext && !isEmbedded && \([\s\S]*?<\/div>\s*\)\}/, (match) => match + '\n<div className={`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 ${isEmbedded ? "p-0" : ""}`}>');
// Wait, I just replaced the header with a regex that ONLY matches `<PageHeader ... />`. The wrapping `{!subjectContext && !isEmbedded && (` is still there.
content = content.replace(/<div className="relative w-full overflow-hidden border-b border-black\/\[0\.04\] dark:border-white\/\[0\.04\] bg-gradient-to-r from-emerald-500\/5 via-transparent to-transparent py-8 shrink-0">[\s\S]*?<\/div>\s*\)\}/, (match) => match + '\n<div className={`flex flex-col p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 ${isEmbedded ? "p-0" : ""}`}>');

// Close wrapper at the end
content = content.replace(/\{!selectedAssessmentType && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/, (match) => match.replace('</div>\n        </div>', '</div>\n</div>\n        </div>'));

fs.writeFileSync(file, content);
