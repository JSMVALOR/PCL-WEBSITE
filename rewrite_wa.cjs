const fs = require('fs');

let path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');

// We'll replace everything below the top imports
const newComponent = `export default function AdminWhatsAppQueue() {
 const [status, setStatus] = useState('LOADING'); // LOADING, UNLINKED, CONNECTED
 const [qrCode, setQrCode] = useState(null);
 const [queue, setQueue] = useState([]);
 const [isDisconnecting, setIsDisconnecting] = useState(false);

 const ENGINE_URL = import.meta.env.VITE_WHATSAPP_ENGINE_URL || 'http://localhost:3005';

 const [groups, setGroups] = useState([]);
 const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'broadcast', 'mapping'
 const [broadcastMsg, setBroadcastMsg] = useState("");
 const [selectedGroup, setSelectedGroup] = useState("");
 const [isSending, setIsSending] = useState(false);
 
 // For Mappings
 const [batches, setBatches] = useState([]);
 const [globalGroups, setGlobalGroups] = useState([]);
 const [isSavingMapping, setIsSavingMapping] = useState(false);

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

 // Load batches and global mapping
 const fetchMappings = async () => {
   const { data: bData } = await supabase.from('academic_batches').select('*').order('start_year', { ascending: false });
   if (bData) setBatches(bData);
   
   const { data: sData } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
   if (sData && sData.value && Array.isArray(sData.value)) {
     setGlobalGroups(sData.value);
   }
 };

 useEffect(() => {
   if (status === 'CONNECTED') {
     fetchGroups();
     fetchMappings();
   }
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

 const saveMappings = async () => {
   setIsSavingMapping(true);
   try {
     // Save global groups
     await supabase.from('system_settings').upsert({
       key: 'global_whatsapp_groups',
       value: globalGroups
     });
     
     // Save batch mappings
     for (const batch of batches) {
       await supabase.from('academic_batches').update({ whatsapp_group_id: batch.whatsapp_group_id }).eq('id', batch.id);
     }
     
     if (window.erpToast) window.erpToast.show("Group assignments saved successfully!", "success");
   } catch (e) {
     if (window.erpToast) window.erpToast.show("Failed to save mappings.", "error");
   } finally {
     setIsSavingMapping(false);
   }
 };

 const fetchStatus = async () => {
   try {
     const res = await fetch(\`\${ENGINE_URL}/api/whatsapp/status\`);
     if (res.ok) {
       const data = await res.json();
       if (data.status === 'CONNECTED') {
         setStatus('CONNECTED');
       } else if (data.status === 'QR_READY') {
         setStatus('UNLINKED');
         setQrCode(data.qr);
       } else {
         setStatus('LOADING');
       }
     }
   } catch (e) {
     console.warn("WhatsApp Engine unreachable at", ENGINE_URL);
   }
 };

 const fetchQueue = async () => {
   const { data, error } = await supabase
     .from('whatsapp_queue')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(50);
   if (data) setQueue(data);
 };

 useEffect(() => {
   fetchStatus();
   fetchQueue();
   
   let interval;
   // Only poll queue aggressively if we are on the queue tab, prevents UI flickering
   if (activeTab === 'queue') {
       interval = setInterval(() => {
         fetchStatus();
         fetchQueue();
       }, 5000);
   } else {
       // Slow poll just for status
       interval = setInterval(() => fetchStatus(), 15000);
   }
   
   return () => clearInterval(interval);
 }, [activeTab]);

 const handleDisconnect = async () => {
   setIsDisconnecting(true);
   try {
     await fetch(\`\${ENGINE_URL}/api/whatsapp/logout\`, { method: 'POST' });
     setStatus('LOADING');
     if (window.erpToast) window.erpToast.show("WhatsApp device disconnected.", "success");
   } catch (e) {
     if (window.erpToast) window.erpToast.show("Failed to disconnect.", "error");
   } finally {
     setIsDisconnecting(false);
   }
 };

 return (
   <div className="w-full animate-fade-in pb-12 font-sans bg-themeApp min-h-screen text-themeText">
     <div className="w-full mx-auto pb-10">
       <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
         <PageHeader 
           icon="fa-brands fa-whatsapp" 
           title="WhatsApp Engine" 
           subtitle="Manage WhatsApp Web link and outbound message queue" 
         />
       </div>

       <div className="px-4 lg:px-8 mt-8">
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
           
           {/* LEFT SIDEBAR: Device Status */}
           <div className="xl:col-span-4 flex flex-col gap-6">
             <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-emerald-500/20">
                 <i className="fa-brands fa-whatsapp"></i>
               </div>
               
               <h3 className="text-xl font-bold tracking-tight mb-2">Device Status</h3>
               
               {status === 'LOADING' && (
                 <div className="flex flex-col items-center py-8">
                   <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent mb-4"></i>
                   <p className="text-sm text-themeTextSec font-medium mt-4">Initializing Engine...</p>
                 </div>
               )}

               {status === 'UNLINKED' && (
                 <div className="flex flex-col items-center w-full">
                   <p className="text-sm text-themeTextSec font-medium mb-6">Scan QR code to enable outbound institutional messaging.</p>
                   {qrCode ? (
                     <div className="w-64 h-64 bg-themeElevated p-4 rounded-2xl mb-6 shadow-lg border border-themeBorder flex items-center justify-center">
                       <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                     </div>
                   ) : (
                     <div className="w-64 h-64 bg-themeElevated p-4 rounded-2xl mb-6 shadow-inner border border-themeBorder flex flex-col items-center justify-center">
                        <i className="fa-solid fa-qrcode text-4xl text-themeTextSec mb-3 opacity-50"></i>
                        <p className="text-xs text-themeTextSec font-bold">Generating QR...</p>
                     </div>
                   )}
                 </div>
               )}

               {status === 'CONNECTED' && (
                 <div className="flex flex-col items-center w-full">
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full mb-6 border border-emerald-500/20 shadow-sm">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-xs font-bold tracking-widest uppercase">Engine Online</span>
                   </div>
                   
                   <p className="text-xs text-themeTextSec/80 font-medium mb-8 max-w-[200px] leading-relaxed">
                     The engine is actively processing outbound messages to students, faculty, and groups.
                   </p>

                   <button 
                     onClick={handleDisconnect}
                     disabled={isDisconnecting}
                     className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                   >
                     {isDisconnecting ? "Disconnecting..." : "Disconnect Device"}
                   </button>
                 </div>
               )}
             </div>
           </div>

           {/* RIGHT SIDEBAR: Action Area */}
           <div className="xl:col-span-8 flex flex-col gap-6">
             {/* Tab Switcher */}
             <div className="flex bg-themeElevated p-1 rounded-xl w-fit">
                 <button onClick={() => setActiveTab('queue')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'queue' ? 'bg-themePanel text-emerald-500 shadow-sm' : 'text-themeTextSec'}\`}>Live Queue</button>
                 <button onClick={() => setActiveTab('mapping')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'mapping' ? 'bg-themePanel text-blue-500 shadow-sm' : 'text-themeTextSec'}\`}>Group Assignments</button>
                 <button onClick={() => setActiveTab('broadcast')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'broadcast' ? 'bg-themePanel text-amber-500 shadow-sm' : 'text-themeTextSec'}\`}>Quick Broadcast</button>
             </div>

             <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
               
               {activeTab === 'queue' && (
                 <>
                  <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                    <div>
                      <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                        <i className="fa-solid fa-list-check text-themeAccent"></i> Outbound Queue
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Live Telemetry</p>
                    </div>
                    <span className="text-xs font-bold bg-themeAccent/10 text-themeAccent px-4 py-2 rounded-full border border-themeAccent/20">
                      {queue.filter(q => q.status === 'PENDING').length} Pending
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto flex-1 p-2 lg:p-4 custom-scrollbar">
                    <table className="w-full text-left border-collapse block md:table">
                      <thead className="hidden md:table-header-group">
                        <tr className="border-b border-themeBorder">
                          <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Time</th>
                          <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Recipient</th>
                          <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Message</th>
                          <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-themeBorder">
                        {queue.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="p-12 text-center flex flex-col items-center justify-center">
                              <i className="fa-regular fa-folder-open text-4xl text-themeTextSec/30 mb-3"></i>
                              <span className="text-themeTextSec font-bold text-sm">No messages in queue</span>
                            </td>
                          </tr>
                        ) : queue.map(item => (
                          <tr key={item.id} className="block md:table-row border-b md:border-none border-themeBorder/50 hover:bg-themeElevated/20 transition-colors p-4 md:p-0">
                            <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">
                              <span className="text-xs font-bold text-themeTextSec whitespace-nowrap">
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                            </td>
                            <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">
                              <span className="text-sm font-bold text-themeText whitespace-nowrap">
                                {item.phone?.includes('@g.us') ? <><i className="fa-solid fa-users mr-1 text-amber-500"></i>Group</> : item.phone}
                              </span>
                            </td>
                            <td className="block md:table-cell px-2 py-1 md:px-6 md:py-4">
                              <p className="text-sm text-themeText max-w-xs truncate" title={item.message}>
                                {item.message}
                              </p>
                            </td>
                            <td className="block md:table-cell px-2 py-2 md:px-6 md:py-4 mt-2 md:mt-0">
                              {item.status === 'PENDING' && <span className="text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider inline-block">PENDING</span>}
                              {item.status === 'SENT' && <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider inline-block">SENT</span>}
                              {item.status === 'FAILED' && (
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider inline-block">FAILED</span>
                                  <span className="text-[9px] text-rose-500 max-w-[150px] truncate" title={item.error_log}>{item.error_log}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                 </>
               )}

               {activeTab === 'mapping' && (
                 <div className="flex flex-col h-full animate-fade-in">
                   <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                     <div>
                       <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                         <i className="fa-solid fa-network-wired text-blue-500"></i> Group Assignments
                       </h3>
                       <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Map WhatsApp groups to academic batches & global broadcasts</p>
                     </div>
                     <button onClick={saveMappings} disabled={isSavingMapping || status !== 'CONNECTED'} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50">
                        {isSavingMapping ? "Saving..." : "Save Mappings"}
                     </button>
                   </div>
                   
                   <div className="p-6 lg:p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
                      {status !== 'CONNECTED' ? (
                         <div className="text-center py-12 text-themeTextSec">
                           <i className="fa-solid fa-link-slash text-4xl mb-4 opacity-50"></i>
                           <p className="font-bold">Connect WhatsApp device to map groups.</p>
                         </div>
                      ) : groups.length === 0 ? (
                         <div className="text-center py-12 text-themeTextSec">
                           <i className="fa-solid fa-users-slash text-4xl mb-4 opacity-50"></i>
                           <p className="font-bold">No groups found on this WhatsApp account.</p>
                           <button onClick={fetchGroups} className="mt-4 bg-themeElevated border border-themeBorder px-4 py-2 rounded-lg text-sm font-bold hover:bg-themeBorder transition-colors">Try Fetching Again</button>
                         </div>
                      ) : (
                        <>
                          {/* Global Broadcast Groups */}
                          <div className="bg-themeElevated/30 border border-themeBorder rounded-2xl p-6">
                            <h4 className="font-bold text-themeText flex items-center gap-2 mb-4">
                              <i className="fa-solid fa-globe text-amber-500"></i> Global Broadcast Groups
                            </h4>
                            <p className="text-xs text-themeTextSec mb-4">Select the groups that should receive ALL general announcements and holiday notices.</p>
                            
                            <div className="flex flex-wrap gap-2">
                               {groups.map(g => {
                                 const isSelected = globalGroups.includes(g.id);
                                 return (
                                   <div 
                                     key={g.id} 
                                     onClick={() => {
                                       if (isSelected) setGlobalGroups(prev => prev.filter(id => id !== g.id));
                                       else setGlobalGroups(prev => [...prev, g.id]);
                                     }}
                                     className={\`cursor-pointer px-4 py-2 rounded-xl border text-sm font-bold transition-all \${isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-themeApp border-themeBorder text-themeTextSec hover:border-themeTextSec'}\`}
                                   >
                                     <i className={\`fa-solid \${isSelected ? 'fa-check' : 'fa-plus'} mr-2\`}></i>
                                     {g.name}
                                   </div>
                                 );
                               })}
                            </div>
                          </div>

                          {/* Class / Batch Mappings */}
                          <div className="bg-themeElevated/30 border border-themeBorder rounded-2xl p-6">
                            <h4 className="font-bold text-themeText flex items-center gap-2 mb-4">
                              <i className="fa-solid fa-graduation-cap text-indigo-500"></i> Class/Batch specific Groups
                            </h4>
                            <p className="text-xs text-themeTextSec mb-6">Assign an official WhatsApp group to each academic batch.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {batches.map((batch, index) => (
                                 <div key={batch.id} className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-themeTextSec uppercase tracking-wider">{batch.name}</label>
                                    <select 
                                      value={batch.whatsapp_group_id || ""} 
                                      onChange={(e) => {
                                        const newBatches = [...batches];
                                        newBatches[index].whatsapp_group_id = e.target.value;
                                        setBatches(newBatches);
                                      }}
                                      className="bg-themeApp border border-themeBorder rounded-xl p-3 text-sm font-bold text-themeText outline-none focus:border-blue-500"
                                    >
                                      <option value="">-- No Group Assigned --</option>
                                      {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} ({g.participants} members)</option>
                                      ))}
                                    </select>
                                 </div>
                               ))}
                            </div>
                          </div>
                        </>
                      )}
                   </div>
                 </div>
               )}

               {activeTab === 'broadcast' && (
                 <form onSubmit={handleBroadcast} className="flex flex-col h-full animate-fade-in">
                   <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                     <div>
                       <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                         <i className="fa-solid fa-bolt text-amber-500"></i> Quick Manual Broadcast
                       </h3>
                       <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Send an ad-hoc message directly</p>
                     </div>
                   </div>

                   <div className="flex flex-col gap-6 p-6 lg:p-8 flex-1">
                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Select Target Group</label>
                       <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} required disabled={status !== 'CONNECTED'} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-amber-500 transition-colors">
                         <option value="">{status === 'CONNECTED' ? (groups.length > 0 ? 'Select a group...' : 'No groups found (Go to assignments tab)') : 'WhatsApp not connected'}</option>
                         {groups.map(g => (
                           <option key={g.id} value={g.id}>{g.name} ({g.participants} members)</option>
                         ))}
                       </select>
                     </div>

                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Message</label>
                       <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} required rows={6} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-amber-500 transition-colors resize-none font-mono text-sm" placeholder="Type your broadcast message..."></textarea>
                     </div>

                     <button type="submit" disabled={isSending || status !== 'CONNECTED'} className="mt-auto bg-amber-500 text-themeApp py-4 rounded-xl font-bold shadow-sm hover:bg-amber-600 transition-colors disabled:opacity-50">
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
`

const importIdx = content.indexOf('export default function AdminWhatsAppQueue() {');
const headerContent = content.substring(0, importIdx);

fs.writeFileSync(path, headerContent + newComponent);
console.log('Rewrote WhatsApp UI completely to fix infinite reloads and add Mappings.');
