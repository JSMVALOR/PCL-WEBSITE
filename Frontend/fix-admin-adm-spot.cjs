const fs = require('fs');
const file = 'ERP/components/Admin/AdminAdmissions/AdminAdmissions.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Context import
content = content.replace(
  /const \{ isAdmissionsOpen \} = useSite\(\);/,
  `const { isAdmissionsOpen, isSpotAdmissionsOpen } = useSite();`
);

// 2. Add handleToggleSpotAdmissions and update handleToggleAdmissions
const oldToggle = ` const handleToggleAdmissions = async () => {
 setIsTogglingStatus(true);
 try {
 const newState = !isAdmissionsOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: newState } 
 }, { onConflict: 'key' });
 
 if (error) throw error;
 window.erpToast?.show?.(\`Admissions \${newState ? 'Opened' : 'Closed'} successfully.\`, 'success');
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle admissions status.", "error");
 } finally {
 setIsTogglingStatus(false);
 }
 };`;

const newToggle = ` const handleToggleAdmissions = async () => {
 setIsTogglingStatus(true);
 try {
 const newState = !isAdmissionsOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: newState, is_spot: isSpotAdmissionsOpen } 
 }, { onConflict: 'key' });
 
 if (error) throw error;
 window.erpToast?.show?.(\`Admissions \${newState ? 'Opened' : 'Closed'} successfully.\`, 'success');
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle admissions status.", "error");
 } finally {
 setIsTogglingStatus(false);
 }
 };

 const handleToggleSpotAdmissions = async () => {
 setIsTogglingStatus(true);
 try {
 const newSpotState = !isSpotAdmissionsOpen;
 const { error } = await supabase
 .from("system_settings")
 .upsert({ 
 key: "admissions_status", 
 value: { is_open: isAdmissionsOpen, is_spot: newSpotState } 
 }, { onConflict: 'key' });
 
 if (error) throw error;
 window.erpToast?.show?.(\`Spot Admissions \${newSpotState ? 'Opened' : 'Closed'} successfully.\`, 'success');
 } catch (error) {
 if(window.erpToast) window.erpToast.show("Failed to toggle spot admissions status.", "error");
 } finally {
 setIsTogglingStatus(false);
 }
 };`;

content = content.replace(oldToggle, newToggle);

// 3. Add Spot Admissions Button UI to Header rightContent (lines ~260)
// The rightContent has a div. We will add a second button.
const oldRightContent = ` <button type="button"
 onClick={handleToggleAdmissions}`;

const newRightContent = ` <button type="button"
 onClick={handleToggleSpotAdmissions}
 disabled={isTogglingStatus}
 className={\`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[14px] font-medium tracking-normal transition flex items-center justify-center gap-2 border border-themeBorder backdrop-blur-md \${isSpotAdmissionsOpen ? 'bg-amber-500/20 hover:bg-amber-500 text-themeText' : 'bg-transparent hover:bg-themePanel text-themeTextSec'}\`}
 >
 <i className={\`fa-solid \${isSpotAdmissionsOpen ? 'fa-bolt' : 'fa-bolt-slash'}\`}></i>
 {isTogglingStatus ? '...' : (isSpotAdmissionsOpen ? 'Close Spot Admissions' : 'Open Spot Admissions')}
 </button>
 <button type="button"
 onClick={handleToggleAdmissions}`;

content = content.replace(oldRightContent, newRightContent);

// 4. Update the mobile/hub view button similarly
const oldHubButton = ` <button type="button"
 onClick={handleToggleAdmissions}
 disabled={isTogglingStatus}
 className={\`px-5 py-3 rounded-xl text-[13px] font-medium transition flex items-center gap-2 border \${isAdmissionsOpen ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'}\`}
 >`;

const newHubButton = ` <button type="button"
 onClick={handleToggleSpotAdmissions}
 disabled={isTogglingStatus}
 className={\`px-5 py-3 rounded-xl text-[13px] font-medium transition flex items-center gap-2 border \${isSpotAdmissionsOpen ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20' : 'bg-transparent text-themeTextSec border-themeBorder'}\`}
 >
 <i className={\`fa-solid \${isSpotAdmissionsOpen ? 'fa-bolt' : 'fa-bolt-slash'}\`}></i>
 {isSpotAdmissionsOpen ? 'Close Spot' : 'Open Spot'}
 </button>
 <button type="button"
 onClick={handleToggleAdmissions}
 disabled={isTogglingStatus}
 className={\`px-5 py-3 rounded-xl text-[13px] font-medium transition flex items-center gap-2 border \${isAdmissionsOpen ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'}\`}
 >`;

content = content.replace(oldHubButton, newHubButton);

fs.writeFileSync(file, content);
console.log('done');
