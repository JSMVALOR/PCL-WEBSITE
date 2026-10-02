const fs = require('fs');
const path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');

const newImportsAndState = `
 const [groups, setGroups] = useState([]);
 const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'broadcast'
 const [broadcastMsg, setBroadcastMsg] = useState("");
 const [selectedGroup, setSelectedGroup] = useState("");
 const [isSending, setIsSending] = useState(false);

 const fetchGroups = async () => {
   if (status !== 'CONNECTED') return;
   try {
     const res = await fetch(\`\${ENGINE_URL}/api/whatsapp/groups\`);
     if (res.ok) {
       const data = await res.json();
       if (data.groups) setGroups(data.groups);
     }
   } catch (e) {
     console.error("Failed to fetch WhatsApp groups");
   }
 };

 useEffect(() => {
   if (status === 'CONNECTED') fetchGroups();
 }, [status]);

 const handleBroadcast = async (e) => {
   e.preventDefault();
   if (!selectedGroup || !broadcastMsg.trim()) return;
   setIsSending(true);
   try {
     const { error } = await supabase.from('whatsapp_queue').insert({
       phone: selectedGroup,
       message: broadcastMsg.trim(),
       status: 'PENDING'
     });
     if (error) throw error;
     setBroadcastMsg("");
     if (window.erpDialog) window.erpDialog.alert("Broadcast message added to queue!", "success");
     setActiveTab('queue');
     fetchQueue();
   } catch(e) {
     if (window.erpDialog) window.erpDialog.alert("Failed to queue broadcast.", "error");
   } finally {
     setIsSending(false);
   }
 };
`;

// Insert the new state right before fetchStatus
content = content.replace(' const fetchStatus = async () => {', newImportsAndState + '\n const fetchStatus = async () => {');

// Add the tabs UI and Broadcast UI
const tabsUI = `
             <div className="flex bg-themeElevated p-1 rounded-xl w-max mb-6">
                 <button onClick={() => setActiveTab('queue')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'queue' ? 'bg-themePanel text-emerald-500 shadow-sm' : 'text-themeTextSec'}\`}>Message Queue</button>
                 <button onClick={() => setActiveTab('broadcast')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'broadcast' ? 'bg-themePanel text-amber-500 shadow-sm' : 'text-themeTextSec'}\`}>Group Broadcast</button>
             </div>
`;

// find the exact line to insert tabs: before the "Message Queue" header in RIGHT SIDEBAR
const rightSidebarStart = `{/* RIGHT SIDEBAR: Queue Table */}`;
content = content.replace(rightSidebarStart, tabsUI + '\n           ' + rightSidebarStart);

// find the queue table section
const queueSection = `
             <div className="bg-themePanel/40 backdrop-blur-2xl border border-themeBorder rounded-3xl p-6 sm:p-8 flex flex-col xl:col-span-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-themeBorder">
                 <div>
                   <h2 className="text-xl font-bold tracking-tight text-themeText">Message Queue</h2>
                   <p className="text-xs text-themeTextSec mt-1">Pending and processed outbound messages</p>
                 </div>
`;

const newRightSidebar = `
             <div className="bg-themePanel/40 backdrop-blur-2xl border border-themeBorder rounded-[2rem] p-6 sm:p-8 flex flex-col xl:col-span-8 shadow-sm">
               {activeTab === 'queue' ? (
                 <>
                   <div className="flex items-center justify-between mb-8 pb-4 border-b border-themeBorder">
                     <div>
                       <h2 className="text-xl font-bold tracking-tight text-themeText">Message Queue</h2>
                       <p className="text-xs text-themeTextSec mt-1">Pending and processed outbound messages</p>
                     </div>
`;

// Replace `xl:col-span-8` wrapper
content = content.replace(queueSection, newRightSidebar);

// Close the queue section and add broadcast section
const endOfQueueTable = `
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}
`;

const replacementEnd = `
               </div>
                 </>
               ) : (
                 <form onSubmit={handleBroadcast} className="flex flex-col h-full">
                   <div className="flex items-center justify-between mb-8 pb-4 border-b border-themeBorder">
                     <div>
                       <h2 className="text-xl font-bold tracking-tight text-themeText">Broadcast to Group</h2>
                       <p className="text-xs text-themeTextSec mt-1">Send a message to an official WhatsApp Group</p>
                     </div>
                     <div className="bg-amber-500/10 text-amber-500 w-12 h-12 rounded-xl flex items-center justify-center text-xl">
                       <i className="fa-solid fa-bullhorn"></i>
                     </div>
                   </div>

                   <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Select Official Group</label>
                       <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} required disabled={status !== 'CONNECTED'} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-amber-500 transition-colors">
                         <option value="">{status === 'CONNECTED' ? 'Select a group...' : 'WhatsApp not connected'}</option>
                         {groups.map(g => (
                           <option key={g.id} value={g.id}>{g.name} ({g.participants} members)</option>
                         ))}
                       </select>
                     </div>

                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Message</label>
                       <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} required rows={6} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-amber-500 transition-colors resize-none font-mono text-sm" placeholder="Type your broadcast message..."></textarea>
                     </div>

                     <button type="submit" disabled={isSending || status !== 'CONNECTED'} className="mt-4 bg-amber-500 text-themeApp py-4 rounded-xl font-bold shadow-sm hover:bg-amber-600 transition-colors disabled:opacity-50">
                       {isSending ? "Queueing Broadcast..." : "Send Broadcast"}
                     </button>
                   </div>
                 </form>
               )}
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}
`;

content = content.replace(endOfQueueTable, replacementEnd);
fs.writeFileSync(path, content);
console.log('Patched AdminWhatsAppQueue.jsx UI');
