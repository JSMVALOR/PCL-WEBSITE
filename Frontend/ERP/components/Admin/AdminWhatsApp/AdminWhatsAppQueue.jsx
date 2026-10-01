import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from '../../shared/PageHeader/PageHeader';

export default function AdminWhatsAppQueue() {
 const [status, setStatus] = useState('LOADING'); // LOADING, UNLINKED, CONNECTED
 const [qrCode, setQrCode] = useState(null);
 const [queue, setQueue] = useState([]);
 const [isDisconnecting, setIsDisconnecting] = useState(false);

 const ENGINE_URL = 'http://localhost:3005';

 const fetchStatus = async () => {
   try {
     const res = await fetch(`${ENGINE_URL}/api/whatsapp/status`);
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
   
   const interval = setInterval(() => {
     fetchStatus();
     fetchQueue();
   }, 5000);
   
   return () => clearInterval(interval);
 }, []);

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
                   <p className="text-[10px] text-themeTextSec/60 font-bold uppercase tracking-widest mt-2">Make sure node server.js is running on port 3005</p>
                 </div>
               )}

               {status === 'UNLINKED' && (
                 <div className="flex flex-col items-center w-full">
                   <p className="text-sm text-themeTextSec font-medium mb-6">Scan QR code to enable outbound institutional messaging.</p>
                   
                   {/* Real QR Code UI */}
                   {qrCode ? (
                     <div className="w-64 h-64 bg-white p-4 rounded-2xl mb-6 shadow-lg border border-gray-200 flex items-center justify-center">
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
                   
                   <p className="text-sm text-themeTextSec font-medium mb-8">
                     Your device is successfully linked and currently processing background jobs.
                   </p>

                   <button onClick={handleDisconnect} disabled={isDisconnecting} className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                     {isDisconnecting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-power-off"></i>}
                     {isDisconnecting ? 'Disconnecting...' : 'Disconnect Device'}
                   </button>
                 </div>
               )}
             </div>
           </div>

           {/* RIGHT SIDEBAR: Message Queue */}
           <div className="xl:col-span-8 flex flex-col gap-6">
             <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
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
                             {item.phone}
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
             </div>
           </div>

         </div>
       </div>
     </div>
   </div>
 );
}
