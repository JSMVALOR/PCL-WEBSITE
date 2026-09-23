import React, { useState, useEffect } from 'react';
import PageHeader from '../../../shared/PageHeader/PageHeader';

export default function AdminWhatsAppServer() {
    const [status, setStatus] = useState('LOADING'); // LOADING, DISCONNECTED, INITIALIZING, QR_READY, AUTHENTICATED, FAILED, WAKING_UP
    const [qrCode, setQrCode] = useState(null);
    const [testNumber, setTestNumber] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Fallback to localhost if not set in .env
    const SERVER_URL = import.meta.env.VITE_WHATSAPP_SERVER_URL || 'http://localhost:3001';

    // Poll server status
    useEffect(() => {
        let isFetching = false;
        const fetchStatus = async () => {
            if (isFetching) return;
            isFetching = true;
            
            try {
                // Set a 5 second timeout to detect sleeping Render instance
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const res = await fetch(`${SERVER_URL}/api/status`, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (res.status === 503 || res.status === 502) {
                    setStatus('WAKING_UP');
                } else if (!res.ok) {
                    throw new Error('Server unreachable');
                } else {
                    const data = await res.json();
                    setStatus(data.status);
                    setQrCode(data.qrCode);
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    setStatus('WAKING_UP');
                } else {
                    console.error("WhatsApp Server offline:", err);
                    setStatus('DISCONNECTED');
                }
            } finally {
                isFetching = false;
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Check every 3s
        return () => clearInterval(interval);
    }, [SERVER_URL]);

    const handleSendTest = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const res = await fetch(`${SERVER_URL}/api/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: testNumber, message: testMessage })
            });
            const data = await res.json();
            
            if (data.success) {
                alert("Message sent successfully!");
                setTestMessage('');
            } else {
                alert("Failed: " + data.error);
            }
        } catch (err) {
            alert("Error sending message. Is the server running?");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20">
                        <PageHeader title="WhatsApp Automation Engine" subtitle="Scan to securely connect your device and send automated alerts without official API limits." icon="fa-whatsapp" />

            {/* EXPERIMENTAL WARNING BANNER */}
            <div className="mx-4 md:mx-6 lg:mx-8 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row gap-4 items-start md:items-center max-w-[1600px] xl:mx-auto">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-flask text-lg"></i>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Experimental Cloud Tier</h4>
                    <p className="text-xs text-themeTextSec font-medium">
                        This engine runs on a free cloud environment (Render). It may take <strong>45-60 seconds to wake up</strong> if it has been idle. You must provide the <code>DATABASE_URL</code> in the Render dashboard to ensure the session survives daily restarts.
                    </p>
                </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto animate-fade-in flex flex-col gap-6">
                
                {/* STATUS BAR */}
                <div className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm backdrop-blur-md ${
                    status === 'AUTHENTICATED' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                    status === 'DISCONNECTED' ? 'bg-rose-500/10 border-rose-500/20' : 
                    'bg-amber-500/10 border-amber-500/20'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white ${
                            status === 'AUTHENTICATED' ? 'bg-emerald-500' : 
                            status === 'DISCONNECTED' ? 'bg-rose-500' : 
                            'bg-amber-500'
                        }`}>
                            <i className="fa-brands fa-whatsapp"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-themeText">Engine Status</h3>
                            <p className="text-xs font-medium text-themeTextSec mt-1">
                                                                {status === 'AUTHENTICATED' ? 'Connected securely via Chromium headless engine.' : 
                                 status === 'WAKING_UP' ? 'Waking up remote cloud engine (this can take up to 60 seconds)...' :
                                 status === 'DISCONNECTED' ? 'Server is offline. Ensure it is deployed to Render.' : 
                                 status === 'QR_READY' ? 'Waiting for device authorization scan...' :
                                 'Initializing browser engine...'}
                            </p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                        status === 'AUTHENTICATED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 
                        status === 'DISCONNECTED' ? 'bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400' : 
                        'bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }`}>
                        {status}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* QR SCANNER / DEVICE CONNECTION */}
                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-3xl p-6 md:p-8 border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center min-h-[400px]">
                        {status === 'QR_READY' && qrCode ? (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="bg-white p-4 rounded-3xl shadow-xl mb-6">
                                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                                </div>
                                <h2 className="text-xl font-bold text-themeText mb-2">Scan with WhatsApp</h2>
                                <p className="text-sm text-themeTextSec text-center max-w-sm">
                                    Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device, and point your camera at this QR code.
                                </p>
                            </div>
                        ) : status === 'AUTHENTICATED' ? (
                            <div className="flex flex-col items-center animate-fade-in text-center">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-4xl mb-6">
                                    <i className="fa-solid fa-check-double"></i>
                                </div>
                                <h2 className="text-2xl font-bold text-themeText mb-2">Device Linked</h2>
                                <p className="text-sm text-themeTextSec text-center max-w-sm">
                                    Your WhatsApp account is successfully connected to the headless engine. Automated notifications (like absent alerts) will now be dispatched instantly.
                                </p>
                            </div>
                                                ) : status === 'WAKING_UP' ? (
                            <div className="flex flex-col items-center text-center">
                                <i className="fa-solid fa-cloud-arrow-up fa-bounce text-4xl text-themeAccent mb-4"></i>
                                <h2 className="text-lg font-bold text-themeText mb-2">Waking Up Cloud Server</h2>
                                <p className="text-sm text-themeTextSec max-w-sm">Render's free tier sleeps after 15 minutes of inactivity. Please wait about 45-60 seconds for the Chromium engine to boot up.</p>
                            </div>
                        ) : status === 'DISCONNECTED' ? (
                            <div className="flex flex-col items-center text-center opacity-50">
                                <i className="fa-solid fa-plug-circle-xmark text-4xl mb-4 text-rose-500"></i>
                                <h2 className="text-lg font-bold text-themeText mb-2">Server Offline</h2>
                                <p className="text-sm text-themeTextSec">Run `node server.js` inside backend/whatsapp-server.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
                                <h2 className="text-lg font-bold text-themeText mb-2">Starting Engine</h2>
                                <p className="text-sm text-themeTextSec">Spinning up Chromium browser instance...</p>
                            </div>
                        )}
                    </div>

                    {/* MANUAL TESTING CONSOLE */}
                    <div className={`bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-3xl p-6 md:p-8 border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-opacity ${status !== 'AUTHENTICATED' ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-themeAccent/10 text-themeAccent flex items-center justify-center">
                                <i className="fa-solid fa-paper-plane text-sm"></i>
                            </div>
                            <h2 className="text-lg font-bold text-themeText">Testing Console</h2>
                        </div>

                        <form onSubmit={handleSendTest} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-themeTextSec uppercase tracking-widest">Recipient Number</label>
                                <input 
                                    type="text" 
                                    required
                                    value={testNumber}
                                    onChange={e => setTestNumber(e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent transition-colors" 
                                />
                                <span className="text-[10px] text-themeTextSec font-medium">+91 is added automatically if exactly 10 digits.</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black text-themeTextSec uppercase tracking-widest">Message Payload</label>
                                <textarea 
                                    required
                                    value={testMessage}
                                    onChange={e => setTestMessage(e.target.value)}
                                    placeholder="Type a test notification..."
                                    className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-themeText outline-none focus:border-themeAccent transition-colors h-32 resize-none" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSending || status !== 'AUTHENTICATED'} 
                                className="w-full py-4 mt-2 bg-themeAccent hover:bg-themeAccent/90 text-white font-black tracking-widest uppercase text-[12px] rounded-xl transition-all shadow-lg shadow-themeAccent/20 flex items-center justify-center gap-2"
                            >
                                {isSending ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                Dispatch Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
