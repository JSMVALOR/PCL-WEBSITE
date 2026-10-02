const fs = require('fs');
let path = 'Frontend/ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state for spot admissions
content = content.replace(
    'const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);',
    'const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);\n const [isSpotOpen, setIsSpotOpen] = useState(false);'
);

// 2. Add to fetch status
content = content.replace(
    'if (statusData && statusData.value && statusData.value.is_open !== undefined) {',
    'if (statusData && statusData.value && statusData.value.is_open !== undefined) {\n setIsAdmissionsOpen(statusData.value.is_open);\n setIsSpotOpen(!!statusData.value.is_spot);\n }'
);

// 3. Toggle functions
content = content.replace(
    /const toggleAdmissionsStatus = async \(\) => {[\s\S]*?setIsTogglingStatus\(false\);\n }/g,
    `const toggleAdmissionsStatus = async () => {
 setIsTogglingStatus(true);
 try {
 const newState = !isAdmissionsOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: newState, is_spot: isSpotOpen } 
 }, { onConflict: 'key' });
 if (error) throw error;
 setIsAdmissionsOpen(newState);
 if(window.erpToast) window.erpToast.show(\`Admissions are now \${newState ? 'OPEN' : 'CLOSED'}\`, "info");
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle admissions status", "info");
 } finally {
 setIsTogglingStatus(false);
 }
 };

 const toggleSpotAdmissions = async () => {
 setIsTogglingStatus(true);
 try {
 const newSpot = !isSpotOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: isAdmissionsOpen, is_spot: newSpot } 
 }, { onConflict: 'key' });
 if (error) throw error;
 setIsSpotOpen(newSpot);
 if(window.erpToast) window.erpToast.show(\`Spot Admissions are now \${newSpot ? 'ACTIVE' : 'INACTIVE'}\`, "info");
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle spot admissions", "info");
 } finally {
 setIsTogglingStatus(false);
 }
 }`
);

// 4. Update UI to show the toggle
const uiTarget = `<div className="flex gap-4">
 <button
 onClick={toggleAdmissionsStatus}
 disabled={isTogglingStatus}
 className={\`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm \${isAdmissionsOpen`;

const replacement = `<div className="flex flex-wrap gap-4">
 <button
 onClick={toggleSpotAdmissions}
 disabled={isTogglingStatus}
 className={\`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm \${isSpotOpen ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-themeElevated text-themeText hover:bg-themeBorder'}\`}
 >
 <i className="fa-solid fa-fire"></i> {isSpotOpen ? "Stop Spot Admissions" : "Start Spot Admissions"}
 </button>
 <button
 onClick={toggleAdmissionsStatus}
 disabled={isTogglingStatus}
 className={\`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm \${isAdmissionsOpen`;

content = content.replace(uiTarget, replacement);

fs.writeFileSync(path, content);
console.log('Patched AdminAdmissions.jsx for Spot Admissions');
