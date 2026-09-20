const fs = require('fs');
const file = 'src/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure import
if (!content.includes('SlideCommit')) {
    content = content.replace(
        "import SwipeRow from '../../../../Shared/components/ReactBits/SwipeRow/SwipeRow';",
        "import SwipeRow from '../../../../Shared/components/ReactBits/SwipeRow/SwipeRow';\nimport SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';"
    );
}

const btnOld = `<button type="button" onClick={handleCloseSession} disabled={activeSession.status === 'completed'} className={\`w-full py-4.5 rounded-2xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight transition-all active:scale-[0.98] mt-auto flex items-center justify-center gap-2 \${activeSession.status === 'completed' ? 'bg-transparent text-gray-400 dark:text-white/40 cursor-not-allowed' : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1C1C1E] dark:text-[#F2F2F7]'}\`}>
 <i className="fa-solid fa-lock text-[12px]"></i> Finalize & Lock Session
 </button>`;

const btnNew = `{activeSession.status === 'completed' ? (
    <button type="button" disabled className="w-full py-4.5 rounded-2xl border border-black/5 dark:border-white/5 text-[14px] font-bold tracking-tight bg-transparent text-gray-400 dark:text-white/40 cursor-not-allowed mt-auto flex items-center justify-center gap-2">
        <i className="fa-solid fa-lock text-[12px]"></i> Finalize & Lock Session
    </button>
) : (
    <div className="mt-auto w-full flex justify-center">
        <SlideCommit
          label="Slide to Finalize Session"
          doneLabel="Session Finalized"
          errorLabel="Finalization Failed"
          onConfirm={handleCloseSession}
          trackColor="rgba(28, 28, 30, 0.05)"
          handleColor="#007AFF"
          successColor="#10b981"
          dangerColor="#f43f5e"
          width={320}
          height={56}
          radius={16}
        />
    </div>
)}`;

content = content.replace(btnOld, btnNew);
fs.writeFileSync(file, content);
console.log("Patched Finalize Session button with SlideCommit");
