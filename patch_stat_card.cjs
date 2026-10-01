const fs = require('fs');
let file = fs.readFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveDashboard.jsx', 'utf8');

const newStatCard = `const StatCard = ({ label, value, icon, color }) => (
    <div className={\`bg-themePanel/40 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-themeBorder dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between transition hover:border-\${color}-500 group relative overflow-hidden h-28\`}>
      <div className={\`absolute inset-0 bg-gradient-to-br from-\${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none\`}></div>
      <div className="flex justify-between items-start w-full relative z-10">
        <p className="text-[10px] font-bold text-themeTextSec group-hover:text-themeText transition-colors uppercase tracking-widest max-w-[70%] leading-tight">{label}</p>
        <div className={\`w-8 h-8 rounded-full bg-\${color}-500/10 flex items-center justify-center text-\${color}-500 text-sm border border-\${color}-500/20 group-hover:bg-\${color}-500 group-hover:text-themeText transition duration-300 shrink-0\`}>
          <i className={\`fa-solid \${icon}\`}></i>
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        <h3 className="text-2xl font-black tracking-tight text-themeText">{isLoading ? "-" : value}</h3>
      </div>
    </div>
  );`;

file = file.replace(/const StatCard = \(\{ label, value, icon, color \}\) => \([\s\S]*?\);\n/m, newStatCard + '\n');

fs.writeFileSync('Frontend/ERP/components/Admin/LeaveManagement/LeaveDashboard.jsx', file);
