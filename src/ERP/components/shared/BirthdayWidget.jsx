/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { useERP } from "../../context/ErpContext";
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';

export default function BirthdayWidget() {
    const { userSession } = useERP();
    const isAdmin = userSession?.role === 'admin' || window.location.pathname.includes('admin');
    
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchBirthdays = async () => {
            try {
                // Fetch profiles where birthday is today (MM-DD matches today)
                // Since date_of_birth might be stored as YYYY-MM-DD
                const today = new Date();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const mmdd = `${month}-${day}`;

                // In Supabase we can use ilike for a quick match if stored as ISO string, or an RPC.
                // We'll use a direct select with a filter, or just fetch all and filter in memory if small, 
                // but for scale RPC is better. For this demo, let's just use an RPC if it existed, or filter in memory.
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role, avatar_url, date_of_birth')
                    .not('date_of_birth', 'is', null);

                if (!error && data) {
                    const todays = data.filter(p => {
                        if (!p.date_of_birth) return false;
                        const dob = new Date(p.date_of_birth);
                        return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
                    });
                    if (isMounted) setBirthdays(todays);
                }
            } catch (err) {
                console.warn(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchBirthdays();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full shrink-0 flex flex-col bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm dark:shadow-sm rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
                        <i className="fa-solid fa-cake-candles"></i> Birthdays Today
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeTextSec mb-4"></i>
                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Checking calendar...</p>
                </div>
            </div>
        );
    }

    if (!birthdays || birthdays.length === 0) {
    return (
        <div className="w-full h-full shrink-0 flex flex-col bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-cake-candles"></i> Birthdays Today
                </h3>
            </div>
            <div className="flex flex-col items-center justify-center h-full opacity-50">
                <i className="fa-solid fa-calendar-day text-2xl text-themeTextSec mb-4"></i>
                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">No Birthdays Today</p>
            </div>
        </div>
    );
}

    return (
        <div className="w-full h-full shrink-0 flex flex-col bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-sm dark:shadow-sm rounded-2xl p-6 relative overflow-hidden group">
            {/* Ambient Background for Party Vibe */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2D55]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF9500]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

            <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-cake-candles text-[#FF2D55]"></i> Birthdays Today
                </h3>
                {isAdmin && (
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <i className="fa-solid fa-bolt"></i> Auto-Sync Active
                    </span>
                )}
            </div>
            
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                <div className="text-center mb-6 mt-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF2D55] to-[#FF9500] p-[1px] mb-3 shadow-sm animate-pulse shadow-[#FF2D55]/20">
                        <div className="w-full h-full bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-gift text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#FF2D55] to-[#FF9500]"></i>
                        </div>
                    </div>
                    <h4 className="text-sm font-black text-themeText leading-tight mb-1">
                        Happy Birthday! <span className="text-lg">🎉</span>
                    </h4>
                    <p className="text-[10px] text-themeTextSec font-bold uppercase tracking-widest">
                        Wishing our Prudentia family a fantastic day
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {birthdays.map((person, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 group hover:bg-black/5 dark:hover:bg-white/15 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {person.avatar_url ? (
                                    <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fa-solid fa-user text-[10px] text-[#8E8E93]"></i>
                                )}
                            </div>
                            <div className="flex flex-col text-left pr-2">
                                <span className="text-[11px] font-bold text-themeText leading-none mb-1 group-hover:text-[#FF2D55] transition-colors">{person.full_name}</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-themeTextSec leading-none">{person.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
