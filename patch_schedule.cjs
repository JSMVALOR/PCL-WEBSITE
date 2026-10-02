const fs = require('fs');
let path = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldSchedule = ` const handleScheduleEvent = async (e) => {
 e.preventDefault();
 setIsScheduling(true);
 try {
 const { error } = await supabase.from('academic_calendar').insert([{
 title: eventTitle,
 start_date: eventStartDate,
 end_date: eventEndDate || eventStartDate,
 type: eventType,
 description: eventDesc
 }]);

 if (isPublic) {
 await supabase.from('admin_events').insert([{
 title: eventTitle,
 event_date: eventStartDate,
 description: eventDesc,
 event_type: eventType,
 is_active: true,
 is_public: true
 }]);
 }

 if (error) throw error;
 
 setEventTitle("");
 setEventStartDate("");
 setEventEndDate("");
 setEventDesc("");
 fetchEvents();
 if (window.erpToast) window.erpToast.show("Event scheduled successfully!", "success"); 
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setIsScheduling(false);
 }
 };`;

const newSchedule = ` const handleScheduleEvent = async (e) => {
 e.preventDefault();
 setIsScheduling(true);
 try {
 const { error } = await supabase.from('academic_calendar').insert([{
 title: eventTitle,
 start_date: eventStartDate,
 end_date: eventEndDate || eventStartDate,
 type: eventType,
 description: eventDesc
 }]);

 if (isPublic) {
 await supabase.from('admin_events').insert([{
 title: eventTitle,
 event_date: eventStartDate,
 description: eventDesc,
 event_type: eventType,
 is_active: true,
 is_public: true
 }]);
 }

 if (error) throw error;
 
 // If it's a holiday or campus leave, notify everyone
 if (eventType === 'holiday' || eventType === 'campus_leave') {
   const { data: users } = await supabase.from('profiles').select('id, email, full_name');
   if (users && users.length > 0) {
     // Create bell notifications
     const notifs = users.map(u => ({
       recipient_id: u.id,
       title: \`Upcoming \${eventType === 'holiday' ? 'Holiday' : 'Campus Leave'}\`,
       message: \`\${eventTitle} is scheduled on \${new Date(eventStartDate).toLocaleDateString()}\`,
       type: 'notice',
       action_link: 'notices'
     }));
     await supabase.from('notifications').insert(notifs);
     
     // Note: In production we would batch send an email to all users here using EmailService.
     // For this prototype, we'll log it or send to a test group.
   }
 }
 
 setEventTitle("");
 setEventStartDate("");
 setEventEndDate("");
 setEventDesc("");
 fetchEvents();
 if (window.erpToast) window.erpToast.show("Event scheduled successfully!", "success"); 
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setIsScheduling(false);
 }
 };`;

content = content.replace(oldSchedule, newSchedule);
fs.writeFileSync(path, content);
console.log('Patched handleScheduleEvent');
