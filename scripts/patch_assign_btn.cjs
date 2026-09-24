const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', 'utf8');

const headerBlock = `{!subjectContext && !isEmbedded && (
 <PageHeader 
 icon="fa-solid fa-file-signature"
 title="Assignment Engine"
 subtitle="Publish assignments, set deadlines, and manage submissions across batches."
 rightContent={
 <button type="button" 
 onClick={() => setShowForm(!showForm)}
 className={\`px-6 py-3.5 rounded-xl text-themeText dark:text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 \${
 showForm ? 'bg-neutral-600 hover:bg-neutral-700' : 'bg-themeAccent hover:bg-themeAccent/90'
 }\`}
 >
 <i className={\`fa-solid \${showForm ? 'fa-xmark' : 'fa-plus'} text-sm\`}></i> 
 {showForm ? 'Cancel' : 'New Assignment'}
 </button>
 }
 />
 )}`;

const headerBlockRepl = `{!subjectContext && (
    <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] border border-black/5 dark:border-white/10 rounded-2xl p-4 lg:p-6 mb-2 shadow-sm">
        <div>
            <h2 className="text-xl font-bold tracking-tight text-themeText dark:text-white">Assignment Engine</h2>
            <p className="text-[12px] font-medium text-themeTextSec dark:text-white/50">Manage all offline submissions</p>
        </div>
        <button type="button" 
        onClick={() => setShowForm(!showForm)}
        className={\`px-6 py-3 rounded-xl text-white text-[13px] font-medium transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm \${
        showForm ? 'bg-neutral-600 hover:bg-neutral-700' : 'bg-blue-600 hover:bg-blue-700'
        }\`}
        >
        <i className={\`fa-solid \${showForm ? 'fa-xmark' : 'fa-plus'} text-sm\`}></i> 
        {showForm ? 'Cancel' : 'New Assignment'}
        </button>
    </div>
 )}`;

code = code.replace(headerBlock, headerBlockRepl);

fs.writeFileSync('Frontend/ERP/components/Faculty/FacultyAssignments/FacultyAssignments.jsx', code);
console.log('Patched FacultyAssignments.jsx button');
