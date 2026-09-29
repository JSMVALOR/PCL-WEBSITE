const fs = require('fs');

// 1. AdminDashboard.jsx - kill ALL unnecessary padding
let dash = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', 'utf8');

// Remove min-h-screen so the page doesn't force a full viewport height when content is less
dash = dash.replace(
  '"min-h-screen bg-themeApp text-themeText"',
  '"bg-themeApp text-themeText"'
);

// Kill the xl:pb-4 — no bottom padding needed at all on desktop
dash = dash.replace(
  '"p-4 sm:p-6 lg:p-8 xl:pb-4"',
  '"p-4 sm:p-6 lg:p-6 xl:pb-0"'
);

// Kill gap between main columns — tighter
dash = dash.replace(
  'flex flex-col gap-4 lg:gap-6',
  'flex flex-col gap-4 lg:gap-4'
);

// Main content area gap
dash = dash.replace(
  'xl:col-span-9 flex flex-col gap-6 min-w-0',
  'xl:col-span-9 flex flex-col gap-4 min-w-0'
);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', dash);

// 2. AdminKPIGrid - reduce bottom padding
let kpi = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx', 'utf8');
kpi = kpi.replace(
  'className="flex flex-col gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-6 mb-2"',
  'className="flex flex-col gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-4"'
);
fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminKPIGrid.jsx', kpi);

// 3. AdminSystemVitals - reduce padding  
let vitals = fs.readFileSync('Frontend/ERP/components/shared/DashboardWidgets/AdminSystemVitals.jsx', 'utf8');
vitals = vitals.replace(
  'className="w-full relative flex-1 min-w-0 flex flex-col py-6 border-b border-black/[0.04] dark:border-white/[0.04]"',
  'className="w-full relative flex-1 min-w-0 flex flex-col py-4 border-b border-black/[0.04] dark:border-white/[0.04]"'
);
vitals = vitals.replace(
  'className="flex justify-between items-start mb-6"',
  'className="flex justify-between items-start mb-4"'
);
vitals = vitals.replace(
  'className="grid grid-cols-3 gap-4 mb-8',
  'className="grid grid-cols-3 gap-4 mb-4'
);
fs.writeFileSync('Frontend/ERP/components/shared/DashboardWidgets/AdminSystemVitals.jsx', vitals);

// 4. DashboardGreetingBanner - reduce bottom padding
let greeting = fs.readFileSync('Frontend/ERP/components/shared/DashboardWidgets/DashboardGreetingBanner.jsx', 'utf8');
greeting = greeting.replace(
  'pb-4 sm:pb-6 border-b border-black/[0.04]',
  'pb-3 sm:pb-4 border-b border-black/[0.04]'
);
fs.writeFileSync('Frontend/ERP/components/shared/DashboardWidgets/DashboardGreetingBanner.jsx', greeting);

// 5. AdminRightSidebar - reduce gaps
let sidebar = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx', 'utf8');
sidebar = sidebar.replace(
  'className="w-full flex flex-col gap-6"',
  'className="w-full flex flex-col gap-4"'
);
fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminRightSidebar.jsx', sidebar);

console.log("Done — all excess spacing stripped.");
