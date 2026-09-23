const fs = require('fs');
let path = 'src/ERP/components/Faculty/FacultyMentorship/FacultyMentorship.jsx';
let content = fs.readFileSync(path, 'utf8');

// Import Attendance
if (!content.includes('Attendance')) {
    content = content.replace(
        /import \{ supabase \} from "\.\.\/\.\.\/\.\.\/supabaseClient";/,
        `import { supabase } from "../../../supabaseClient";\nimport Attendance from "../../Student/Attendance/Attendance";`
    );
}

// Add State
if (!content.includes('selectedMentee')) {
    content = content.replace(
        /const \[actionLoading, setActionLoading\] = useState\(null\);/,
        `const [actionLoading, setActionLoading] = useState(null);\n    const [selectedMentee, setSelectedMentee] = useState(null);`
    );
}

// Add onClick to mentee card
content = content.replace(
    /className="bg-white dark:bg-\[\#121212\] border border-themeBorder dark:border-white\/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-amber-500\/30 transition-colors"/g,
    `className="bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-amber-500/30 transition-colors cursor-pointer" onClick={() => setSelectedMentee(m)}`
);

// If a mentee is selected, render their Attendance instead of the main dashboard
const renderMain = `
    return (
        <div className="w-full min-h-screen bg-themeApp text-themeText dark:text-themeText animate-fade-in">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 lg:p-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                            <i className="fa-solid fa-users"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white">Mentorship Hub</h1>
                            <p className="text-sm font-medium text-themeTextSec mt-1">Manage mentees and track academic progress.</p>
                        </div>
                    </div>
                </div>

                {selectedMentee ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4 mb-2">
                            <button onClick={() => setSelectedMentee(null)} className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-arrow-left text-themeTextSec dark:text-white/60"></i>
                            </button>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-themeText dark:text-white">{selectedMentee.full_name}'s Profile</h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">{selectedMentee.erp_id}</p>
                            </div>
                        </div>
                        <div className="bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                            <Attendance menteeId={selectedMentee.id} isEmbedded={true} />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
`;

// Replace the start of the return statement
content = content.replace(
    /return \([\s\S]*?<div className="flex flex-col lg:flex-row gap-6">/,
    renderMain
);

// We need to add the closing brace for the ternary condition
const finalDiv = `
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
`;
content = content.replace(
    /<\/div>\s*<\/div>\s*\)\;\s*\}\s*$/,
    finalDiv + "\n}"
);

fs.writeFileSync(path, content);
console.log("Faculty Mentorship Patched.");
