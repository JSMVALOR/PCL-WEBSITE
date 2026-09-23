import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { createWhatsAppGroup, sendSystemWhatsApp } from '../../../lib/EmailService';

export default function WhatsAppAdmin() {
    const [waStatus, setWaStatus] = useState('CHECKING'); // CHECKING, DISCONNECTED, QR_READY, CONNECTED
    const [qrCode, setQrCode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const endpoint = '/api/whatsapp/status';
            const res = await fetch(endpoint);
            const data = await res.json();
            setWaStatus(data.status);
            if (data.qr) setQrCode(data.qr);
            if (data.logs) setLogs(data.logs);
        } catch (error) {
            console.error("Failed to fetch WhatsApp status", error);
            setWaStatus('ERROR');
        }
    };

    
    const handleGenerateGroups = async () => {
        if (!(await window.erpDialog?.confirm("This will automatically generate WhatsApp groups for all active academic batches and invite students. Proceed?"))) return;
        setIsLoading(true);
        try {
            // Group students by batch
            const { data: students, error } = await supabase.from('profiles').select('full_name, phone, academic_batch').eq('role', 'student').not('academic_batch', 'is', null);
            if (error) throw error;
            
            const batches = {};
            students.forEach(s => {
                if (s.phone && s.phone.length >= 10) {
                    if (!batches[s.academic_batch]) batches[s.academic_batch] = [];
                    batches[s.academic_batch].push(s.phone);
                }
            });

            for (const [batch, phones] of Object.entries(batches)) {
                if (phones.length > 0) {
                    const groupName = `PCL Batch: ${batch}`;
                    try {
                        const groupId = await createWhatsAppGroup(groupName, phones);
                        await sendSystemWhatsApp(groupId, `Welcome to the official WhatsApp broadcast group for ${batch}. This group will be used for automated attendance and exam notices.`);
                    } catch (e) {
                        console.error(`Failed to create group for ${batch}`, e);
                    }
                }
            }
            window.erpToast.success("Batch groups generated successfully!");
        } catch (error) {
            console.error(error);
            window.erpToast.error("Failed to generate groups.");
        }
        setIsLoading(false);
    };

    const handleReset = async () => {
        setIsLoading(true);
        try {
            const endpoint = '/api/whatsapp/reset';
            await fetch(endpoint, { method: 'POST' });
            setWaStatus('DISCONNECTED');
            setQrCode(null);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full flex flex-col gap-6 relative z-10 p-6 md:p-8 min-h-screen font-sans animate-fade-in">
            <header className="mb-6">
                <h1 className="text-[28px] font-semibold tracking-tight text-themeText dark:text-white flex items-center gap-3">
                    <i className="fa-brands fa-whatsapp text-emerald-500"></i> WhatsApp Engine
                </h1>
                <p className="text-sm font-medium text-themeTextSec dark:text-white/50 mt-2">Link your official WhatsApp Business device here to power automated headless notifications for attendance and exams.</p>
            </header>

            <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none rounded-[24px] p-10 max-w-2xl mx-auto w-full text-center flex flex-col items-center gap-6">
                
                {waStatus === 'CHECKING' && (
                    <div className="flex flex-col items-center gap-4 text-themeTextSec dark:text-white/50 py-12">
                        <i className="fa-solid fa-circle-notch fa-spin text-4xl"></i>
                        <p className="text-xs font-bold tracking-normal">Pinging WhatsApp Engine...</p>
                    </div>
                )}

                {waStatus === 'ERROR' && (
                    <div className="flex flex-col items-center gap-4 text-rose-500 py-12">
                        <i className="fa-solid fa-triangle-exclamation text-5xl"></i>
                        <p className="text-sm font-bold">Failed to connect to the Node.js Backend.</p>
                        <p className="text-xs opacity-70">Ensure backend-email server is running on port 3001.</p>
                    </div>
                )}

                {waStatus === 'QR_READY' && qrCode && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
                        <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 ring-1 ring-black/5">
                            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight text-themeText dark:text-white mb-2">Link Device</h2>
                            <ol className="text-sm text-themeTextSec dark:text-white/50 text-left list-decimal list-inside space-y-2 max-w-sm">
                                <li>Open WhatsApp on your phone.</li>
                                <li>Tap <strong>Menu</strong> (⋮) or <strong>Settings</strong> (⚙️).</li>
                                <li>Tap <strong>Linked Devices</strong>.</li>
                                <li>Tap <strong>Link a Device</strong> and point your camera at the screen.</li>
                            </ol>
                        </div>
                    </motion.div>
                )}

                {waStatus === 'CONNECTED' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6 py-10">
                        <div className="w-32 h-32 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border-4 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                            <i className="fa-brands fa-whatsapp text-6xl"></i>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-themeText dark:text-white mb-2">Engine is Live & Routing</h2>
                            <p className="text-sm text-themeTextSec dark:text-white/50 max-w-md mx-auto">Your WhatsApp session is securely linked. Automated attendance alerts, group generation, and exam reminders will now be routed through this session.</p>
                        </div>
                        
                        
                        <div className="flex gap-4 mt-4">
                            <button onClick={handleGenerateGroups} disabled={isLoading} className="px-6 py-3 bg-[#007AFF]/10 text-themeAccent hover:bg-[#007AFF] hover:text-themeText dark:text-white rounded-xl text-[14px] font-medium tracking-normal transition-colors">
                                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Auto-Generate Batch Groups"}
                            </button>
                            <button onClick={handleReset} disabled={isLoading} className="px-6 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white rounded-xl text-[14px] font-medium tracking-normal transition-colors">
                                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Disconnect Device"}
                            </button>
                        </div>
                        
                        <div className="w-full max-w-2xl mt-8 text-left bg-black/[0.02] dark:bg-white/[0.02] rounded-[20px] p-6 border border-black/[0.04] dark:border-white/[0.04] shadow-inner">
                            <h3 className="text-sm font-bold text-themeText dark:text-white tracking-normal mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-satellite-dish text-emerald-500"></i> Live Broadcast Preview
                            </h3>
                            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
                                {logs.length === 0 ? (
                                    <p className="text-xs text-themeTextSec dark:text-white/50 italic">No messages broadcasted yet...</p>
                                ) : (
                                    logs.map((log, idx) => (
                                        <div key={idx} className="bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-black/5 dark:border-white/5 text-xs">
                                            <span className="text-themeTextSec dark:text-white/50 font-bold mr-2">[{log.time}]</span>
                                            <span className="text-themeText dark:text-white">{log.msg}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </motion.div>
                )}

            </div>
        </div>
    );
}
