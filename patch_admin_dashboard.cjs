const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', 'utf8');

// Add imports
file = file.replace(
  "import AdminFeeProgress from \"../../shared/DashboardWidgets/AdminFeeProgress\";",
  "import AdminFeeProgress from \"../../shared/DashboardWidgets/AdminFeeProgress\";\nimport { AdminLeaveWidget } from \"../../shared/DashboardWidgets\";\nimport { supabase } from \"../../../../Shared/lib/supabase/supabaseClient\";\nimport { useEffect } from \"react\";"
);

// Add state hook
const stateHook = `
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [viewMode, setViewMode] = useState('dashboard');
 const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);

 useEffect(() => {
   const checkAdmissions = async () => {
     try {
       const { data, error } = await supabase.from('system_settings').select('value').eq('key', 'admissions_status').single();
       if (!error && data && data.value) {
         setIsAdmissionsOpen(data.value.is_open !== false);
       }
     } catch (e) {
       // Ignore
     }
   };
   checkAdmissions();
 }, []);
`;

file = file.replace(/const \[isSidebarOpen, setIsSidebarOpen\] = useState\(false\);\n const \[viewMode, setViewMode\] = useState\('dashboard'\);/, stateHook);

// Switch the widget conditionally
const oldWidget = `<AdminAdmissionsPipeline setActiveTab={setActiveTab} />`;
const newWidget = `{isAdmissionsOpen ? <AdminAdmissionsPipeline setActiveTab={setActiveTab} /> : <AdminLeaveWidget setActiveTab={setActiveTab} />}`;

file = file.replace(oldWidget, newWidget);

fs.writeFileSync('Frontend/ERP/components/Admin/AdminDashboard/AdminDashboard.jsx', file);
