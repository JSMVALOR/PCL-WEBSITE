const fs = require('fs');
let code = fs.readFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', 'utf8');

// 1. Import AcademicCalendarGrid
if (!code.includes('AcademicCalendarGrid')) {
    code = code.replace(
        'import PageHeader from "../../shared/PageHeader/PageHeader";',
        'import PageHeader from "../../shared/PageHeader/PageHeader";\nimport AcademicCalendarGrid from "./AcademicCalendarGrid";'
    );
}

// 2. Add Tab rendering logic
code = code.replace(
    "{activeTab === 'broadcast' ? renderBroadcastTab() : renderEventsTab()}",
    "{activeTab === 'broadcast' ? renderBroadcastTab() : activeTab === 'events' ? renderEventsTab() : <AcademicCalendarGrid />}"
);

// 3. Add the third button in the navigation tabs
const newButton = `
 <button type="button" onClick={() => setActiveTab('grid')} className={\`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max \${activeTab === 'grid' ? 'bg-themeAccent text-themeText dark:text-white border border-themeAccent scale-100' : 'text-themeTextSec hover:text-themeText hover:bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] border border-transparent scale-95 hover:scale-100'}\`}>
 <i className="fa-solid fa-table-cells"></i> Calendar Grid
 </button>
`;

code = code.replace(
    '</button>\n </div>\n\n {activeTab ===',
    `</button>\n ${newButton}\n </div>\n\n {activeTab ===`
);

fs.writeFileSync('Frontend/ERP/components/Admin/notices/AdminNotices.jsx', code);
console.log("Updated AdminNotices.jsx with AcademicCalendarGrid");
