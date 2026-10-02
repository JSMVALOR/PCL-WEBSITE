const fs = require('fs');
const path = 'Frontend/ERP/components/Admin/AdminWhatsApp/AdminWhatsAppQueue.jsx';
let content = fs.readFileSync(path, 'utf8');

// Find the RIGHT SIDEBAR comment and replace everything from there to end of component
const marker = '{/* RIGHT SIDEBAR: Message Queue */}';
const idx = content.indexOf(marker);
if (idx === -1) {
    console.log("Marker not found, trying alternative...");
    process.exit(1);
}

const beforeMarker = content.substring(0, idx);
const afterEnd = `
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const newRightSidebar = `{/* RIGHT SIDEBAR: Message Queue / Group Broadcast */}
           <div className="xl:col-span-8 flex flex-col gap-6">
             {/* Tab Switcher */}
             <div className="flex bg-themeElevated p-1 rounded-xl w-fit">
                 <button onClick={() => setActiveTab('queue')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'queue' ? 'bg-themePanel text-emerald-500 shadow-sm' : 'text-themeTextSec'}\`}>Message Queue</button>
                 <button onClick={() => setActiveTab('broadcast')} className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${activeTab === 'broadcast' ? 'bg-themePanel text-amber-500 shadow-sm' : 'text-themeTextSec'}\`}>Group Broadcast</button>
             </div>

             <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
               {activeTab === 'queue' ? (
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
               ) : (
                 <form onSubmit={handleBroadcast} className="flex flex-col h-full">
                   <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                     <div>
                       <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                         <i className="fa-solid fa-bullhorn text-amber-500"></i> Broadcast to Group
                       </h3>
                       <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Send to official WhatsApp groups</p>
                     </div>
                   </div>

                   <div className="flex flex-col gap-6 p-6 lg:p-8 flex-1">
                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Select Official Group</label>
                       <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} required disabled={status !== 'CONNECTED'} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-amber-500 transition-colors">
                         <option value="">{status === 'CONNECTED' ? (groups.length > 0 ? 'Select a group...' : 'No groups found') : 'WhatsApp not connected'}</option>
                         {groups.map(g => (
                           <option key={g.id} value={g.id}>{g.name} ({g.participants} members)</option>
                         ))}
                       </select>
                       {status === 'CONNECTED' && groups.length === 0 && (
                         <button type="button" onClick={fetchGroups} className="text-xs text-themeAccent font-bold self-start hover:underline">
                           <i className="fa-solid fa-rotate-right mr-1"></i> Refresh Groups
                         </button>
                       )}
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
`;

content = beforeMarker + newRightSidebar + afterEnd;
fs.writeFileSync(path, content);
console.log("Fixed WhatsApp Queue UI with tabs and broadcast form.");
