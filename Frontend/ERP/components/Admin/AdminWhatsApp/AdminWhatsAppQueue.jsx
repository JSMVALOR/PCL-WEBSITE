import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../supabaseClient';

export default function AdminWhatsAppQueue() {
    const [status, setStatus] = useState('LOADING');
    const [qrCode, setQrCode] = useState(null);
    const [queue, setQueue] = useState([]);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`http://${window.location.hostname}:3005/api/whatsapp/status`);
            const data = await res.json();
            setStatus(data.status);
            if (data.qr) setQrCode(data.qr);
        } catch (e) {
            setStatus('OFFLINE');
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

    const handleLogout = async () => {
        if (await window.erpDialog.confirm("Are you sure you want to disconnect WhatsApp?")) {
            await fetch(`http://${window.location.hostname}:3005/api/whatsapp/logout`, { method: 'POST' });
            setStatus('DISCONNECTED');
            window.erpToast.show("WhatsApp Disconnected", "success");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-themeText flex items-center gap-3">
                        <i className="fa-brands fa-whatsapp text-green-500"></i> WhatsApp Engine
                    </h1>
                    <p className="text-themeTextSec mt-1">Autonomous messaging background worker</p>
                </div>
                
                <div className="flex items-center gap-3 bg-themePanel px-4 py-2 rounded-xl border border-themeBorder shadow-sm">
                    <div className={`w-3 h-3 rounded-full ${status === 'CONNECTED' ? 'bg-green-500 animate-pulse' : status === 'OFFLINE' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                    <span className="font-bold text-themeText text-sm">
                        {status === 'CONNECTED' ? 'Engine Online' : status === 'OFFLINE' ? 'Service Offline' : 'Awaiting Link'}
                    </span>
                    {status === 'CONNECTED' && (
                        <button onClick={handleLogout} className="ml-4 text-xs font-bold text-red-500 hover:text-red-400">
                            Disconnect
                        </button>
                    )}
                </div>
            </div>

            {status === 'QR_READY' && qrCode && (
                <div className="bg-themePanel p-8 rounded-2xl border border-themeBorder shadow-sm flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-black text-themeText">Link WhatsApp Device</h2>
                    <p className="text-themeTextSec text-center max-w-md">Open WhatsApp on your official college phone, go to Linked Devices, and scan this QR code to authenticate the background engine.</p>
                    <div className="bg-white p-4 rounded-xl border-4 border-themeBorder mt-4">
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                    </div>
                </div>
            )}
            
            {status === 'OFFLINE' && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-600 dark:text-red-400">
                    <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
                    <div>
                        <h3 className="font-black">Background Node Service is Offline</h3>
                        <p className="text-sm">Ensure you are running the backend ERP engine via "npm run dev". The WhatsApp engine runs on port 3005.</p>
                    </div>
                </div>
            )}

            <div className="bg-themePanel border border-themeBorder rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-themeBorder flex justify-between items-center">
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
                            <tr className="bg-black/5 dark:bg-white/5 text-themeTextSec text-xs uppercase tracking-wider">
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
                                <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
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
                                        {item.status === 'PENDING' && <span className="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded font-bold text-xs">PENDING</span>}
                                        {item.status === 'SENT' && <span className="text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded font-bold text-xs">SENT</span>}
                                        {item.status === 'FAILED' && (
                                            <div className="flex flex-col">
                                                <span className="text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded font-bold text-xs w-max">FAILED</span>
                                                <span className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={item.error_log}>{item.error_log}</span>
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
