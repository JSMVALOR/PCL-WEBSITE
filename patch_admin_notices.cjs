const fs = require('fs');

const path = 'Frontend/ERP/components/Admin/notices/AdminNotices.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldFetchNotices = `
 const fetchNotices = async () => {
 try {
 const { data, error } = await supabase
 .from('notices')
 .select('*')
 .limit(300)
 .order('created_at', { ascending: false });
 if (!error && data) setNotices(data);
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
`;

const newFetchNotices = `
 const fetchNotices = async () => {
 try {
 const { data, error } = await supabase
 .from('notices')
 .select('*')
 .neq('category', 'System Alert') // Exclude personal system alerts
 .limit(300)
 .order('created_at', { ascending: false });
 
 if (!error && data) {
     // Additional client-side filtering to ensure no 'person' targeted broadcasts show up in the global broadcast manager
     const globalBroadcasts = data.filter(n => n.target_audience !== 'person');
     setNotices(globalBroadcasts);
 }
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
`;

content = content.replace(oldFetchNotices, newFetchNotices);

fs.writeFileSync(path, content);
console.log('Patched AdminNotices.jsx');
