import React, { useState, useEffect } from 'react';

export default function ZohoProfileCard({ session, roleLabel }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="bg-[#18181A] rounded-2xl border border-white/[0.04] flex flex-col items-center pt-14 pb-8 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)] mt-12 relative backdrop-blur-xl">
            {/* Floating Profile Image */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-[4px] border-[#050505]">
                {session?.avatar_url ? (
                    <img src={session.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-gray-900 dark:text-white text-3xl font-bold">
                        {session?.full_name?.charAt(0) || 'U'}
                    </div>
                )}
            </div>

            <div className="text-center w-full">
                <h3 className="text-[#F2F2F7] font-semibold text-[15px] truncate tracking-tight">{session?.full_name || 'Admin User'}</h3>
                <p className="text-[#8E8E93] text-[12px] mt-1 font-medium">{roleLabel}</p>
                
                <div className="mt-5 text-[#FF453A] font-bold text-[11px] uppercase tracking-[0.2em]">
                    Out
                </div>
                
                <div className="mt-3 text-[#F2F2F7] font-mono text-[22px] tracking-widest bg-black/40 py-3 rounded-xl border border-black/50 w-full shadow-inner">
                    {formatTime(time)}
                </div>
            </div>
        </div>
    );
}
