import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from '../../shared/PageHeader/PageHeader';

const ENGINE_URL = import.meta.env.VITE_WHATSAPP_ENGINE_URL || 'http://localhost:3005';

// Templates are now fetched from whatsapp_templates table

export default function AdminWhatsAppQueue() {
 const [status, setStatus] = useState('LOADING'); // LOADING, UNLINKED, CONNECTED
 const [qrCode, setQrCode] = useState(null);
 const [queue, setQueue] = useState([]);
 const [isDisconnecting, setIsDisconnecting] = useState(false);

 const [groups, setGroups] = useState([]);
 const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'broadcast', 'mapping', 'templates', 'contacts'
 const [broadcastMsg, setBroadcastMsg] = useState("");
 const [selectedGroups, setSelectedGroups] = useState([]);
 const [isSending, setIsSending] = useState(false);
 
 // For Mappings
 const [batches, setBatches] = useState([]);
 const [globalGroups, setGlobalGroups] = useState([]);
 const [isSavingMapping, setIsSavingMapping] = useState(false);

 // For Templates
 const [templatesList, setTemplatesList] = useState([]);
 const [selectedTemplate, setSelectedTemplate] = useState('');
 const [templateVars, setTemplateVars] = useState({});
 const [templatePreview, setTemplatePreview] = useState('');

 // For Contacts
 const [contacts, setContacts] = useState([]);
 const [contactFilter, setContactFilter] = useState('student');
 const [contactBatchFilter, setContactBatchFilter] = useState('');
 const [isLoadingContacts, setIsLoadingContacts] = useState(false);
 const [selectedContacts, setSelectedContacts] = useState([]);
 
 // For Email
 const [sendViaEmail, setSendViaEmail] = useState(false);

 // Derived selectable groups based on assignments
 const assignedGroupIds = [...new Set([...globalGroups, ...batches.map(b => b.whatsapp_group_id).filter(Boolean)])];
 const selectableGroups = groups.filter(g => assignedGroupIds.includes(g.id));

 // Refs for preventing stale closure issues and unnecessary re-renders
 const statusRef = useRef(status);
 const queueRef = useRef(queue);
 const pollTimerRef = useRef(null);
 
 statusRef.current = status;
 queueRef.current = queue;

 const fetchGroups = useCallback(async () => {
   if (statusRef.current !== 'CONNECTED') return;
   try {
     const res = await fetch(`${ENGINE_URL}/api/whatsapp/groups`);
     if (res.ok) {
       const data = await res.json();
       if (data.groups) {
         setGroups(data.groups);
         // Select all by default
         setSelectedGroups(data.groups.map(g => g.id));
       }
     }
   } catch (e) {
     console.error("Failed to fetch WhatsApp groups");
   }
 }, []);

 const fetchTemplates = useCallback(async () => {
   const { data } = await supabase.from('whatsapp_templates').select('*').order('created_at');
   if (data && data.length > 0) {
     const parsed = data.map(t => {
       const fields = [...t.message_body.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]);
       return { ...t, fields };
     });
     setTemplatesList(parsed);
     setSelectedTemplate(parsed[0].template_code);
   }
 }, []);

 // Load batches and global mapping
 const fetchMappings = useCallback(async () => {
   const { data: bData } = await supabase.from('academic_batches').select('*').order('start_year', { ascending: false });
   if (bData) setBatches(bData);
   
   const { data: sData } = await supabase.from('system_settings').select('value').eq('key', 'global_whatsapp_groups').single();
   if (sData && sData.value && Array.isArray(sData.value)) {
     setGlobalGroups(sData.value);
   }
 }, []);

 // Fetch contacts from engine
 const fetchContacts = useCallback(async () => {
   setIsLoadingContacts(true);
   try {
     const params = new URLSearchParams();
     if (contactFilter) params.append('role', contactFilter);
     if (contactBatchFilter) params.append('batch', contactBatchFilter);
     
     const res = await fetch(`${ENGINE_URL}/api/whatsapp/contacts?${params.toString()}`);
     if (res.ok) {
       const data = await res.json();
       setContacts(data.contacts || []);
     }
   } catch (e) {
     // Fallback: fetch directly from supabase
     try {
       let query = supabase.from('profiles').select('id, full_name, phone, parent_phone, email, role, academic_batch, erp_id');
       if (contactFilter) query = query.eq('role', contactFilter);
       if (contactBatchFilter) query = query.eq('academic_batch', contactBatchFilter);
       const { data } = await query.order('full_name');
       setContacts((data || []).map(p => ({
         id: p.id,
         name: p.full_name,
         phone: p.phone,
         parent_phone: p.parent_phone,
         email: p.email,
         role: p.role,
         batch: p.academic_batch,
         erp_id: p.erp_id,
       })));
     } catch (e2) {
       console.error("Failed to fetch contacts", e2);
     }
   } finally {
     setIsLoadingContacts(false);
   }
 }, [contactFilter, contactBatchFilter]);

 useEffect(() => {
   if (status === 'CONNECTED') {
     fetchGroups();
     fetchMappings();
     fetchTemplates();
   }
 }, [status, fetchGroups, fetchMappings, fetchTemplates]);

 const handleBroadcast = async (e) => {
   e.preventDefault();
   if (!broadcastMsg.trim()) return;
   setIsSending(true);
   try {
     // If sending to groups
     if (selectedGroups.length > 0) {
       const items = selectedGroups.map(gid => ({
         phone: gid,
         message: broadcastMsg.trim(),
         status: 'PENDING',
         recipient_name: groups.find(g => g.id === gid)?.name || 'Group',
       }));
       if (items.length > 0) {
         const { error } = await supabase.from('whatsapp_queue').insert(items);
         if (error) { console.error(error); throw error; }
       }
     }
     // If sending to selected contacts
     if (selectedContacts.length > 0) {
       const items = selectedContacts.map(c => ({
         phone: c.phone,
         message: broadcastMsg.trim(),
         status: 'PENDING',
         recipient_name: c.name,
       })).filter(item => item.phone);
       if (items.length > 0) {
         const { error } = await supabase.from('whatsapp_queue').insert(items);
         if (error) throw error;
       }
     }
     setBroadcastMsg("");
     setSelectedContacts([]);
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

 const fetchStatus = useCallback(async () => {
   try {
     const res = await fetch(`${ENGINE_URL}/api/whatsapp/status`);
     if (res.ok) {
       const data = await res.json();
       const newStatus = data.status === 'CONNECTED' ? 'CONNECTED' 
                       : data.status === 'QR_READY' ? 'UNLINKED' 
                       : 'LOADING';
       
       // Only update state if actually changed
       if (newStatus !== statusRef.current) {
         setStatus(newStatus);
       }
       
       if (data.status === 'QR_READY' && data.qr) {
         setQrCode(prev => prev === data.qr ? prev : data.qr);
       } else if (data.status === 'CONNECTED') {
         setQrCode(null);
       }
     }
   } catch (e) {
     // Only set LOADING if we were previously connected (engine became unreachable)
     if (statusRef.current === 'CONNECTED') {
       setStatus('LOADING');
     }
   }
 }, []);

 const fetchQueue = useCallback(async () => {
   const { data, error } = await supabase
     .from('whatsapp_queue')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(50);
   if (data) {
     // Compare using a lightweight check instead of full JSON.stringify on every poll
     const newIds = data.map(d => d.id + d.status).join(',');
     const oldIds = queueRef.current.map(d => d.id + d.status).join(',');
     if (newIds !== oldIds) {
       setQueue(data);
     }
   }
 }, []);

 // Stable polling that doesn't cause re-mounts
 useEffect(() => {
   fetchStatus();
   fetchQueue();
   
   const interval = activeTab === 'queue' 
     ? setInterval(() => { fetchStatus(); fetchQueue(); }, 8000) // Slower poll to reduce flicker
     : setInterval(() => fetchStatus(), 20000); // Very slow poll when not on queue tab
   
   pollTimerRef.current = interval;
   return () => clearInterval(interval);
 }, [activeTab, fetchStatus, fetchQueue]);

 const handleDisconnect = async () => {
   setIsDisconnecting(true);
   try {
     await fetch(`${ENGINE_URL}/api/whatsapp/logout`, { method: 'POST' });
     setStatus('LOADING');
     if (window.erpToast) window.erpToast.show("WhatsApp device disconnected.", "success");
   } catch (e) {
     if (window.erpToast) window.erpToast.show("Failed to disconnect.", "error");
   } finally {
     setIsDisconnecting(false);
   }
 };

 // Template preview
 useEffect(() => {
   const tpl = templatesList.find(t => t.template_code === selectedTemplate);
   if (tpl) {
     let preview = tpl.message_body;
     tpl.fields.forEach(f => {
       preview = preview.replace(new RegExp(`\\{\\{${f}\\}\\}`, 'g'), templateVars[f] || `<${f}>`);
     });
     setTemplatePreview(preview);
   } else {
     setTemplatePreview('');
   }
 }, [selectedTemplate, templateVars, templatesList]);

 const handleSendTemplate = async (e) => {
   e.preventDefault();
   if (selectedContacts.length === 0 && selectedGroups.length === 0) {
     if (window.erpDialog) window.erpDialog.alert("Select at least one recipient or group.", "error");
     return;
   }
   setIsSending(true);
   try {
     const tpl = templatesList.find(t => t.template_code === selectedTemplate);
     if (!tpl) throw new Error("Template not found");
     
     let finalMsg = tpl.message_body;
     tpl.fields.forEach(f => {
       finalMsg = finalMsg.replace(new RegExp(`\\{\\{${f}\\}\\}`, 'g'), templateVars[f] || '');
     });

     const items = [];
     let emailsSent = 0;
     // To selected contacts
     for (const c of selectedContacts) {
       if (c.phone) {
         items.push({
           phone: c.phone,
           message: finalMsg,
           status: 'PENDING',
           recipient_name: c.name,
           template_id: selectedTemplate,
         });
       }
       if (sendViaEmail && c.email) {
         try {
           await fetch('/api/send-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               to_email: c.email,
               subject: `Important Update: ${tpl.label}`,
               message_body: `<p>Dear ${c.name},</p><p>${finalMsg.replace(/\n/g, '<br/>')}</p><p>Regards,<br/>Prudentia College of Law</p>`
             })
           });
           emailsSent++;
         } catch(err) { console.error("Email err", err); }
       }
     }
     // To selected groups
     for (const gid of selectedGroups) {
       items.push({
         phone: gid,
         message: finalMsg,
         status: 'PENDING',
         recipient_name: groups.find(g => g.id === gid)?.name || 'Group',
         template_id: selectedTemplate,
       });
     }
     if (items.length > 0) {
       const { error } = await supabase.from('whatsapp_queue').insert(items);
       if (error) { console.error(error); throw error; }
     }
     setTemplateVars({});
     setSelectedContacts([]);
     // Keep groups selected
     let toastMsg = `${items.length} message(s) queued!`;
     if (emailsSent > 0) toastMsg = `${items.length} WhatsApp msg(s) queued & ${emailsSent} Email(s) sent!`;
     if (window.erpToast) window.erpToast.show(toastMsg, "success");
     setActiveTab('queue');
     fetchQueue();
   } catch (e) {
     if (window.erpToast) window.erpToast.show("Failed to queue template messages.", "error");
   } finally {
     setIsSending(false);
   }
 };

 return (
   <div className="w-full animate-fade-in pb-12 font-sans bg-themeApp min-h-screen text-themeText">
     <div className="w-full mx-auto pb-10">
       <div className="px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8 w-full">
         <PageHeader 
           icon="fa-brands fa-whatsapp" 
           title="WhatsApp Engine" 
           subtitle="Manage WhatsApp Web link, message templates, and outbound queue" 
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
                   <p className="text-[10px] text-themeTextSec/60 mt-2 font-mono">{ENGINE_URL}</p>
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

             {/* Quick Stats Card */}
             {status === 'CONNECTED' && (
               <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] p-6 shadow-sm">
                 <h4 className="text-sm font-bold text-themeTextSec uppercase tracking-widest mb-4">Queue Stats</h4>
                 <div className="grid grid-cols-3 gap-3">
                   <div className="text-center">
                     <div className="text-2xl font-black text-amber-500">{queue.filter(q => q.status === 'PENDING').length}</div>
                     <div className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Pending</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-black text-emerald-500">{queue.filter(q => q.status === 'SENT').length}</div>
                     <div className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Sent</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-black text-rose-500">{queue.filter(q => q.status === 'FAILED').length}</div>
                     <div className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Failed</div>
                   </div>
                 </div>
               </div>
             )}
           </div>

           {/* RIGHT SIDEBAR: Action Area */}
           <div className="xl:col-span-8 flex flex-col gap-6">
             {/* Tab Switcher */}
             <div className="flex bg-themeElevated p-1 rounded-xl w-fit flex-wrap gap-1">
                 <button onClick={() => setActiveTab('queue')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'queue' ? 'bg-themePanel text-emerald-500 shadow-sm' : 'text-themeTextSec'}`}>Live Queue</button>
                 <button onClick={() => setActiveTab('mapping')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'mapping' ? 'bg-themePanel text-blue-500 shadow-sm' : 'text-themeTextSec'}`}>Group Assignments</button>
                 <button onClick={() => setActiveTab('broadcast')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'broadcast' ? 'bg-themePanel text-amber-500 shadow-sm' : 'text-themeTextSec'}`}>Quick Broadcast</button>
                 <button onClick={() => setActiveTab('templates')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'templates' ? 'bg-themePanel text-purple-500 shadow-sm' : 'text-themeTextSec'}`}>Templates</button>
                 <button onClick={() => { setActiveTab('contacts'); fetchContacts(); }} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'contacts' ? 'bg-themePanel text-cyan-500 shadow-sm' : 'text-themeTextSec'}`}>Contacts</button>
             </div>

             <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
               
               {/* ===== QUEUE TAB ===== */}
               {activeTab === 'queue' && (
                 <>
                  <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                    <div>
                      <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                        <i className="fa-solid fa-list-check text-themeAccent"></i> Outbound Queue
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Live Telemetry • Refreshes every 8s</p>
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
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-themeText whitespace-nowrap">
                                  {item.recipient_name || (item.phone?.includes('@g.us') || item.phone?.includes('-') ? <><i className="fa-solid fa-users mr-1 text-amber-500"></i>Group</> : item.phone)}
                                </span>
                                {item.template_id && (
                                  <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">{item.template_id.replace(/_/g, ' ')}</span>
                                )}
                              </div>
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

               {/* ===== MAPPING TAB ===== */}
               {activeTab === 'mapping' && (
                 <div className="flex flex-col h-full animate-fade-in">
                   <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                     <div>
                       <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                         <i className="fa-solid fa-network-wired text-blue-500"></i> Group Assignments
                       </h3>
                       <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Map WhatsApp groups to academic batches &amp; global broadcasts</p>
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
                            <h4 className="font-bold text-themeText flex items-center gap-2 mb-2">
                              <i className="fa-solid fa-globe text-amber-500"></i> Global Broadcast Groups
                            </h4>
                            <p className="text-xs text-themeTextSec mb-6">These groups will receive ALL general announcements and holiday notices.</p>
                            
                            <div className="flex flex-col gap-4">
                              {/* Selected Groups as Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {globalGroups.length === 0 && (
                                  <div className="col-span-full text-center py-6 border border-dashed border-themeBorder rounded-xl text-themeTextSec text-sm font-bold">
                                    No global broadcast groups added yet.
                                  </div>
                                )}
                                {globalGroups.map(id => {
                                  const groupObj = groups.find(g => g.id === id);
                                  return (
                                    <div key={id} className="bg-themeApp border border-amber-500/30 rounded-xl p-4 flex items-start justify-between group shadow-sm hover:border-amber-500 transition-colors">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                          <i className="fa-solid fa-users"></i>
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-themeText text-sm line-clamp-1" title={groupObj?.name || 'Unknown Group'}>{groupObj?.name || 'Unknown Group'}</h5>
                                          <span className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold">{groupObj?.participants || '?'} members</span>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => setGlobalGroups(prev => prev.filter(gid => gid !== id))}
                                        className="text-themeTextSec hover:text-rose-500 hover:bg-rose-500/10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                                      >
                                        <i className="fa-solid fa-xmark"></i>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Add Group Dropdown */}
                              <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-4 border-t border-themeBorder">
                                <select 
                                  id="newGlobalGroupSelect"
                                  className="flex-1 bg-themeApp border border-themeBorder rounded-xl p-3 text-sm font-bold text-themeText outline-none focus:border-amber-500"
                                >
                                  <option value="">Select a group to add...</option>
                                  {groups.filter(g => !globalGroups.includes(g.id)).map(g => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.participants} members)</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => {
                                    const selectEl = document.getElementById('newGlobalGroupSelect');
                                    if (selectEl && selectEl.value) {
                                      setGlobalGroups(prev => [...prev, selectEl.value]);
                                      selectEl.value = "";
                                    }
                                  }}
                                  className="bg-amber-500 text-themeApp px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors whitespace-nowrap"
                                >
                                  <i className="fa-solid fa-plus mr-2"></i> Add Group
                                </button>
                              </div>
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

               {/* ===== BROADCAST TAB ===== */}
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
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider flex items-center justify-between">
                         <span>Select Target Groups</span>
                         {selectableGroups.length > 0 && (
                           <button type="button" onClick={() => setSelectedGroups(selectedGroups.length === selectableGroups.length ? [] : selectableGroups.map(g => g.id))} className="text-amber-500 hover:text-amber-600 text-[10px]">
                             {selectedGroups.length === selectableGroups.length ? 'Deselect All' : 'Select All'}
                           </button>
                         )}
                       </label>
                       <div className="flex flex-wrap gap-3">
                         {selectableGroups.length > 0 ? selectableGroups.map(g => (
                           <label key={g.id} className={`flex items-center gap-3 border p-3 rounded-xl cursor-pointer transition-all ${selectedGroups.includes(g.id) ? 'bg-amber-500/10 border-amber-500/50' : 'bg-themeElevated border-themeBorder hover:border-themeTextSec'}`}>
                             <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={(e) => {
                               if (e.target.checked) setSelectedGroups(prev => [...prev, g.id]);
                               else setSelectedGroups(prev => prev.filter(id => id !== g.id));
                             }} className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-themeBorder bg-themeApp" />
                             <span className="text-sm font-bold text-themeText">{g.name} <span className="text-xs text-themeTextSec font-normal ml-1">({g.participants} members)</span></span>
                           </label>
                         )) : <span className="text-xs text-themeTextSec p-3 bg-themeElevated rounded-xl border border-themeBorder w-full">{status === 'CONNECTED' ? 'No groups are mapped in Assignments tab' : 'WhatsApp not connected'}</span>}
                       </div>
                     </div>

                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Message</label>
                       <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} required rows={6} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-amber-500 transition-colors resize-none font-mono text-sm" placeholder="Type your broadcast message..."></textarea>
                     </div>

                     <button type="submit" disabled={isSending || status !== 'CONNECTED' || (selectedGroups.length === 0 && selectedContacts.length === 0)} className="mt-auto bg-amber-500 text-themeApp py-4 rounded-xl font-bold shadow-sm hover:bg-amber-600 transition-colors disabled:opacity-50">
                       {isSending ? "Queueing Broadcast..." : "Send Broadcast"}
                     </button>
                   </div>
                 </form>
               )}

               {/* ===== TEMPLATES TAB ===== */}
               {activeTab === 'templates' && (
                 <form onSubmit={handleSendTemplate} className="flex flex-col h-full animate-fade-in">
                   <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                     <div>
                       <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                         <i className="fa-solid fa-file-lines text-purple-500"></i> Message Templates
                       </h3>
                       <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Send pre-built template messages</p>
                     </div>
                   </div>

                   <div className="flex flex-col gap-6 p-6 lg:p-8 flex-1 overflow-y-auto custom-scrollbar">
                     <div className="flex flex-col gap-2">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">Select Template</label>
                       <select value={selectedTemplate} onChange={e => { setSelectedTemplate(e.target.value); setTemplateVars({}); }} disabled={status !== 'CONNECTED' || templatesList.length === 0} className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-purple-500 transition-colors font-bold">
                         {templatesList.length === 0 && <option value="">No templates found</option>}
                         {templatesList.map(t => (
                           <option key={t.template_code} value={t.template_code}>{t.label}</option>
                         ))}
                       </select>
                     </div>

                     {/* Template Fields */}
                     {(() => {
                       const tpl = templatesList.find(t => t.template_code === selectedTemplate);
                       if (!tpl) return null;
                       return tpl.fields.map(field => (
                         <div key={field} className="flex flex-col gap-2">
                           <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider">{field.replace(/_/g, ' ')}</label>
                           {field === 'message' || field === 'content' || field === 'description' ? (
                             <textarea
                               value={templateVars[field] || ''}
                               onChange={e => setTemplateVars(prev => ({ ...prev, [field]: e.target.value }))}
                               rows={4}
                               className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-purple-500 transition-colors resize-none font-mono text-sm"
                               placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                             />
                           ) : (
                             <input
                               type="text"
                               value={templateVars[field] || ''}
                               onChange={e => setTemplateVars(prev => ({ ...prev, [field]: e.target.value }))}
                               className="bg-themeElevated border border-themeBorder rounded-xl p-4 text-themeText outline-none focus:border-purple-500 transition-colors text-sm"
                               placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                             />
                           )}
                         </div>
                       ));
                     })()}

                     {/* Target: Group or Contact */}
                     <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-themeBorder/50">
                       <label className="text-[13px] font-bold text-themeTextSec uppercase tracking-wider flex items-center justify-between">
                         <span>Send to Group(s)</span>
                         {selectableGroups.length > 0 && (
                           <button type="button" onClick={() => setSelectedGroups(selectedGroups.length === selectableGroups.length ? [] : selectableGroups.map(g => g.id))} className="text-purple-500 hover:text-purple-600 text-[10px]">
                             {selectedGroups.length === selectableGroups.length ? 'Deselect All' : 'Select All'}
                           </button>
                         )}
                       </label>
                       <div className="flex flex-wrap gap-3">
                         {selectableGroups.length > 0 ? selectableGroups.map(g => (
                           <label key={g.id} className={`flex items-center gap-3 border p-3 rounded-xl cursor-pointer transition-all ${selectedGroups.includes(g.id) ? 'bg-purple-500/10 border-purple-500/50' : 'bg-themeElevated border-themeBorder hover:border-themeTextSec'}`}>
                             <input type="checkbox" checked={selectedGroups.includes(g.id)} onChange={(e) => {
                               if (e.target.checked) setSelectedGroups(prev => [...prev, g.id]);
                               else setSelectedGroups(prev => prev.filter(id => id !== g.id));
                             }} className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-themeBorder bg-themeApp" />
                             <span className="text-sm font-bold text-themeText">{g.name} <span className="text-xs text-themeTextSec font-normal ml-1">({g.participants} members)</span></span>
                           </label>
                         )) : <span className="text-xs text-themeTextSec p-3 bg-themeElevated rounded-xl border border-themeBorder w-full">{status === 'CONNECTED' ? 'No groups are mapped in Assignments tab' : 'WhatsApp not connected'}</span>}
                       </div>
                     </div>

                     {selectedContacts.length > 0 && (
                       <div className="bg-themeElevated/30 border border-themeBorder rounded-xl p-4">
                         <div className="flex justify-between items-center mb-2">
                           <p className="text-xs font-bold text-themeTextSec">{selectedContacts.length} contact(s) selected from Contacts tab</p>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={sendViaEmail} onChange={(e) => setSendViaEmail(e.target.checked)} className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-themeBorder bg-themeApp" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-themeText">Also send via Email</span>
                           </label>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {selectedContacts.slice(0, 5).map(c => (
                             <span key={c.id} className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 rounded-lg text-[10px] font-bold">{c.name}</span>
                           ))}
                           {selectedContacts.length > 5 && <span className="text-xs text-themeTextSec font-bold">+{selectedContacts.length - 5} more</span>}
                         </div>
                       </div>
                     )}

                     <button type="submit" disabled={isSending || status !== 'CONNECTED' || (selectedGroups.length === 0 && selectedContacts.length === 0) || templatesList.length === 0} className="mt-auto bg-purple-500 text-white py-4 rounded-xl font-bold shadow-sm hover:bg-purple-600 transition-colors disabled:opacity-50">
                       {isSending ? "Queueing..." : "Send Template Message"}
                     </button>
                   </div>
                 </form>
               )}

               {/* ===== CONTACTS TAB ===== */}
               {activeTab === 'contacts' && (
                 <div className="flex flex-col h-full animate-fade-in">
                   <div className="p-6 lg:p-8 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
                     <div>
                       <h3 className="text-lg font-bold text-themeText flex items-center gap-3">
                         <i className="fa-solid fa-address-book text-cyan-500"></i> Student & Parent Contacts
                       </h3>
                       <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-bold mt-1">Browse and select recipients for direct messaging</p>
                     </div>
                     <div className="flex gap-2 items-center">
                       <select value={contactFilter} onChange={e => setContactFilter(e.target.value)} className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-2 text-sm font-bold text-themeText outline-none">
                         <option value="student">Students</option>
                         <option value="faculty">Faculty</option>
                         <option value="">All</option>
                       </select>
                       {batches.length > 0 && (
                         <select value={contactBatchFilter} onChange={e => setContactBatchFilter(e.target.value)} className="bg-themeElevated border border-themeBorder rounded-xl px-4 py-2 text-sm font-bold text-themeText outline-none">
                           <option value="">All Batches</option>
                           {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                         </select>
                       )}
                       <button onClick={fetchContacts} className="bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-cyan-600 transition-colors">
                         <i className="fa-solid fa-sync mr-1"></i> Fetch
                       </button>
                     </div>
                   </div>

                   <div className="overflow-y-auto flex-1 p-4 lg:p-6 custom-scrollbar">
                     {isLoadingContacts ? (
                       <div className="text-center py-12">
                         <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent mb-4"></i>
                         <p className="text-sm text-themeTextSec font-bold mt-4">Loading contacts...</p>
                       </div>
                     ) : contacts.length === 0 ? (
                       <div className="text-center py-12 text-themeTextSec">
                         <i className="fa-solid fa-users-slash text-4xl mb-4 opacity-50"></i>
                         <p className="font-bold">No contacts found. Click "Fetch" to load.</p>
                       </div>
                     ) : (
                       <>
                         {selectedContacts.length > 0 && (
                           <div className="mb-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
                             <span className="text-sm font-bold text-cyan-500">{selectedContacts.length} contact(s) selected</span>
                             <div className="flex gap-2">
                               <button onClick={() => setSelectedContacts([])} className="text-xs font-bold text-themeTextSec hover:text-rose-500">Clear All</button>
                               <button onClick={() => setActiveTab('templates')} className="bg-purple-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors">Send Template →</button>
                               <button onClick={() => setActiveTab('broadcast')} className="bg-amber-500 text-themeApp px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors">Broadcast →</button>
                             </div>
                           </div>
                         )}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {contacts.map(c => {
                             const isSelected = selectedContacts.some(sc => sc.id === c.id);
                             return (
                               <div 
                                 key={c.id} 
                                 onClick={() => {
                                   if (isSelected) {
                                     setSelectedContacts(prev => prev.filter(sc => sc.id !== c.id));
                                   } else {
                                     setSelectedContacts(prev => [...prev, c]);
                                   }
                                 }}
                                 className={`cursor-pointer rounded-xl p-4 border transition-all ${isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-themeBorder bg-themeElevated/20 hover:border-cyan-500/50'}`}
                               >
                                 <div className="flex items-start gap-3">
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${isSelected ? 'bg-cyan-500 text-white' : 'bg-themeElevated text-themeTextSec'}`}>
                                     {isSelected ? <i className="fa-solid fa-check"></i> : (c.name?.charAt(0) || '?')}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                     <h5 className="font-bold text-themeText text-sm truncate">{c.name || 'Unknown'}</h5>
                                     <div className="flex flex-col gap-0.5 mt-1">
                                       {c.phone && (
                                         <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                           <i className="fa-solid fa-phone"></i> {c.phone}
                                         </span>
                                       )}
                                       {c.parent_phone && (
                                         <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                           <i className="fa-solid fa-user-shield"></i> Parent: {c.parent_phone}
                                         </span>
                                       )}
                                       {c.parent?.phone && (
                                         <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                           <i className="fa-solid fa-user-shield"></i> Parent (linked): {c.parent.phone}
                                         </span>
                                       )}
                                       {!c.phone && !c.parent_phone && (
                                         <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                                           <i className="fa-solid fa-triangle-exclamation"></i> No phone number
                                         </span>
                                       )}
                                     </div>
                                     <div className="flex gap-2 mt-1">
                                       {c.batch && <span className="text-[9px] font-bold bg-themeElevated text-themeTextSec px-2 py-0.5 rounded">{c.batch}</span>}
                                       {c.erp_id && <span className="text-[9px] font-bold text-themeTextSec">{c.erp_id}</span>}
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               )}
             </div>
           </div>

         </div>
       </div>
     </div>
   </div>
 );
}
