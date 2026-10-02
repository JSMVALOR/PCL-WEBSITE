const fs = require('fs');
let path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = ` const fetchQueue = async () => {
   const { data, error } = await supabase
     .from('whatsapp_queue')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(50);
   if (data) setQueue(data);
 };`;

const replacement = ` const fetchQueue = async (currentQueue) => {
   const { data, error } = await supabase
     .from('whatsapp_queue')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(50);
   if (data) {
     // Prevent unnecessary re-renders to stop UI flashing/reloading perception
     setQueue(prev => {
       if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
       return data;
     });
   }
 };`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Fixed queue flickering in AdminWhatsAppQueue.jsx");
} else {
    console.log("Could not find target block in AdminWhatsAppQueue.jsx");
}
