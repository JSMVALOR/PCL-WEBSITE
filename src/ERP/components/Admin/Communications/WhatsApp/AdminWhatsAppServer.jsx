import React, { useState, useEffect } from 'react';
import PageHeader from '../../../shared/PageHeader/PageHeader';

export default function AdminWhatsAppServer() {
    const [status, setStatus] = useState('LOADING'); // LOADING, DISCONNECTED, INITIALIZING, QR_READY, AUTHENTICATED, FAILED
    const [qrCode, setQrCode] = useState(null);
    const [testNumber, setTestNumber] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Poll server status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/status');
                if (!res.ok) throw new Error('Server unreachable');
                const data = await res.json();
                setStatus(data.status);
                setQrCode(data.qrCode);
            } catch (err) {
                console.error("WhatsApp Server offline:", err);
                setStatus('DISCONNECTED');
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Check every 3s
        return () => clearInterval(interval);
    }, []);

    const handleSendTest = async (e) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const res = await fetch('http://localhost:3001/api/send', {
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
                                 status === 'DISCONNECTED' ? 'Local WhatsApp Server is offline. Start the Node.js process on port 3001.' : 
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
