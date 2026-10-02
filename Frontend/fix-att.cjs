const fs = require('fs');
const file = 'ERP/components/Student/Attendance/Attendance.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldProfileQuery = ` let studentBatch = userSession?.academic_batch || '';
 if (menteeId) {
 const { data: menteeProfile } = await supabase
 .from('profiles')
 .select('academic_batch')
 .eq('id', menteeId)
 .single();
 if (menteeProfile?.academic_batch) studentBatch = menteeProfile.academic_batch;
 }`;

const newProfileQuery = ` let studentBatch = userSession?.academic_batch || '';
 let studentJoinDate = null;
 if (menteeId) {
 const { data: menteeProfile } = await supabase
 .from('profiles')
 .select('academic_batch, joining_date')
 .eq('id', menteeId)
 .single();
 if (menteeProfile?.academic_batch) studentBatch = menteeProfile.academic_batch;
 if (menteeProfile?.joining_date) studentJoinDate = new Date(menteeProfile.joining_date);
 } else {
 const { data: myProfile } = await supabase
 .from('profiles')
 .select('joining_date')
 .eq('id', studentId)
 .single();
 if (myProfile?.joining_date) studentJoinDate = new Date(myProfile.joining_date);
 }
 if (studentJoinDate) studentJoinDate.setHours(0,0,0,0);`;

content = content.replace(oldProfileQuery, newProfileQuery);

const oldLoop = ` // Iterate over past dates to simulate what classes *should* have happened
 pastDates.forEach(dateObj => {
 const dateStr = dateObj.toISOString().split('T')[0];`;

const newLoop = ` // Iterate over past dates to simulate what classes *should* have happened
 pastDates.forEach(dateObj => {
 if (studentJoinDate && dateObj < studentJoinDate) return; // Wave Architecture: Skip classes before joining
 const dateStr = dateObj.toISOString().split('T')[0];`;

content = content.replace(oldLoop, newLoop);

fs.writeFileSync(file, content);
console.log('done');
