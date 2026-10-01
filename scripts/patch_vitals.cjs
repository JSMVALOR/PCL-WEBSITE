const fs = require('fs');
const file = 'Frontend/ERP/components/shared/DashboardWidgets/AdminSystemVitals.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const vitalsConfig = \[\s*\{ name: "Database Load", value: Math.round\(stats\.dbLoad\), color: "bg-\[#007AFF\]" \},\s*\{ name: "Storage Capacity", value: stats\.storageCap, color: "bg-\[#FF9F0A\]" \},\s*\{ name: "API Rate Limits", value: stats\.apiLimit, color: "bg-\[#34C759\]" \},\s*\];/,
    `const vitalsConfig = [
    { name: "Database Load", value: Math.round(stats.dbLoad), color: "bg-themeAccent" },
    { name: "Storage Capacity", value: stats.storageCap, color: "bg-amber-500" },
    { name: "API Rate Limits", value: stats.apiLimit, color: "bg-emerald-500" },
  ];`
);

fs.writeFileSync(file, content);
