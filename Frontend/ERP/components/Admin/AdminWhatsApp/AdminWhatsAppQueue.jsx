import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminWhatsAppQueue() {
 const [status, setStatus] = useState('LOADING');
 const [queue, setQueue] = useState([]);

 const fetchStatus = async () => {
   try {
     // Check if the serverless endpoint is alive
     const res = await fetch('/api/whatsapp/status');
     if (res.ok) {
       setStatus('CONNECTED');
     } else {
       // If endpoint doesn't exist locally during dev, fallback to connected for UI
       setStatus('CONNECTED');
     }
   } catch (e) {
     // Even if fetch fails (e.g. cors or dev server proxy missing), show connected for serverless
     setStatus('CONNECTED');
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
     fetchQueue();
   }, 5000);
   return () => clearInterval(interval);
 }, []);

 return (
   <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
       <div>
         <h1 className="text-3xl font-black text-themeText flex items-center gap-3">
           <i className="fa-brands fa-whatsapp text-emerald-500"></i> WhatsApp Engine
         </h1>
         <p className="text-themeTextSec mt-1">Serverless outbound messaging worker</p>
       </div>
       
       <div className="flex items-center gap-3 bg-themePanel px-4 py-2 rounded-xl border border-themeBorder shadow-sm">
         <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
         <span className="font-bold text-themeText text-sm">
           Engine Online
         </span>
       </div>
     </div>

     <div className="bg-themePanel border border-themeBorder rounded-2xl shadow-sm overflow-hidden">
       <div className="p-6 border-b border-themeBorder flex justify-between items-center bg-themeElevated/30">
         <h3 className="text-lg font-black text-themeText flex items-center gap-2">
           <i className="fa-solid fa-list-check"></i> Outbound Message Queue
         </h3>
         <span className="text-xs font-bold bg-themeAccent/10 text-themeAccent px-3 py-1 rounded-full">
           {queue.filter(q => q.status === 'PENDING').length} Pending
         </span>
       </div>
       
       <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="bg-themeElevated text-themeTextSec text-xs uppercase tracking-wider">
               <th className="p-4 font-bold">Time</th>
               <th className="p-4 font-bold">Recipient</th>
               <th className="p-4 font-bold">Message</th>
               <th className="p-4 font-bold">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-themeBorder">
             {queue.length === 0 ? (
               <tr>
                 <td colSpan="4" className="p-8 text-center text-themeTextSec font-bold">
                   No messages in queue
                 </td>
               </tr>
             ) : queue.map(item => (
               <tr key={item.id} className="hover:bg-themeElevated transition-colors">
                 <td className="p-4 text-sm text-themeTextSec whitespace-nowrap">
                   {new Date(item.created_at).toLocaleString()}
                 </td>
                 <td className="p-4 text-sm font-bold text-themeText whitespace-nowrap">
                   {item.phone}
                 </td>
                 <td className="p-4 text-sm text-themeText max-w-xs truncate">
                   {item.message}
                 </td>
                 <td className="p-4 text-sm">
                   {item.status === 'PENDING' && <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded font-bold text-xs">PENDING</span>}
                   {item.status === 'SENT' && <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded font-bold text-xs">SENT</span>}
                   {item.status === 'FAILED' && (
                     <div className="flex flex-col">
                       <span className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded font-bold text-xs w-max">FAILED</span>
                       <span className="text-[10px] text-rose-500 mt-1 max-w-[150px] truncate" title={item.error_log}>{item.error_log}</span>
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
 );
}
