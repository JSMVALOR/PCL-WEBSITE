const fs = require('fs');
let path = 'Frontend/ERP/components/Faculty/FacultyAttendance/FacultyAttendance.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `const handleResolveUnmarked = async (missedSlot) => {
 setIsSaving(true);`;

const replacement = `const handleResolveUnmarked = async (missedSlot) => {
 // Check 15-minute lock rule for marking
 if (!missedSlot.isMarked) {
   try {
     const classDateStr = missedSlot.date || getLocalDateString(new Date());
     const [h, m, s] = missedSlot.time.split(':').map(Number);
     const classStart = new Date(classDateStr);
     classStart.setHours(h, m, s, 0);
     const now = new Date();
     const diffMins = (now - classStart) / (1000 * 60);
  
     if (diffMins > 15) {
       window.erpDialog?.alert("Attendance Portal Closed.\\n\\nPer college policy, attendance must be marked within the first 15 minutes of the class start time. You can no longer mark this past class.");
       return;
     }
   } catch(e) { console.error("Time parse error", e); }
 }

 setIsSaving(true);`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content);
console.log('Added 15-minute lock to resolve unmarked');
