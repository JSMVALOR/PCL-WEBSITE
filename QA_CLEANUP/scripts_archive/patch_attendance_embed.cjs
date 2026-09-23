const fs = require('fs');
let path = 'src/ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('isEmbedded')) {
    content = content.replace(
        /export default function Attendance\(\{ menteeId \}\) \{/,
        `export default function Attendance({ menteeId, isEmbedded = false }) {`
    );
    
    // Hide the header and outer padding if embedded
    content = content.replace(
        /<div className="w-full min-h-screen bg-themeApp text-themeText dark:text-themeText animate-fade-in">/,
        `<div className={\`w-full animate-fade-in \${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-themeText" : ""}\`}>`
    );
    
    content = content.replace(
        /<div className="w-full max-w-\[1800px\] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">/,
        `<div className={\`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 \${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : "p-4"}\`}>`
    );

    // Hide the header section
    content = content.replace(
        /\{\/\* Header \*\/\}([\s\S]*?)<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">/,
        `{!isEmbedded && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 lg:p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl shadow-inner">
                                <i className="fa-solid fa-clipboard-user"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white">Attendance Ledger</h1>
                                <p className="text-sm font-medium text-themeTextSec mt-1">Real-time attendance metrics across all subjects.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">`
    );
}

fs.writeFileSync(path, content);
console.log("Patched Attendance.jsx embed");
