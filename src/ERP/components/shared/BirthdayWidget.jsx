/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../context/ErpContext";
import { motion, AnimatePresence } from 'framer-motion';

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
                // Since dob might be stored as YYYY-MM-DD
                const today = new Date();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const mmdd = `${month}-${day}`;

                // In Supabase we can use ilike for a quick match if stored as ISO string, or an RPC.
                // We'll use a direct select with a filter, or just fetch all and filter in memory if small, 
                // but for scale RPC is better. For this demo, let's just use an RPC if it existed, or filter in memory.
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role, profile_picture_url, dob')
                    .not('dob', 'is', null);

                if (!error && data) {
                    const todays = data.filter(p => {
                        if (!p.dob) return false;
                        const dob = new Date(p.dob);
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
            <div className="w-full h-full shrink-0 flex flex-col bg-transparent p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                    <h3 className="text-[13px] font-medium tracking-normal text-themeTextSec flex items-center gap-2">
                        <i className="fa-solid fa-cake-candles"></i> Birthdays Today
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeTextSec mb-4"></i>
                    <p className="text-[13px] font-medium text-themeTextSec tracking-normal">Checking calendar...</p>
                </div>
            </div>
        );
    }

    if (!birthdays || birthdays.length === 0) {
    return (
        <div className="w-full h-full shrink-0 flex flex-col bg-transparent p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                <h3 className="text-[13px] font-medium tracking-normal text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-cake-candles"></i> Birthdays Today
                </h3>
            </div>
            <div className="flex flex-col items-center justify-center h-full opacity-50">
                <i className="fa-solid fa-calendar-day text-2xl text-themeTextSec mb-4"></i>
                <p className="text-[13px] font-medium text-themeTextSec tracking-normal">No Birthdays Today</p>
            </div>
        </div>
    );
}

    return (
        <div className="w-full h-full shrink-0 flex flex-col bg-transparent p-6 relative overflow-hidden group">
            {/* Ambient Background for Party Vibe */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2D55]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF9500]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

            <div className="flex justify-between items-center mb-5 shrink-0 relative z-10">
                <h3 className="text-[13px] font-medium tracking-normal text-themeTextSec flex items-center gap-2">
                    <i className="fa-solid fa-cake-candles text-[#FF2D55]"></i> Birthdays Today
                </h3>
                {isAdmin && (
                    <span className="text-[11px] font-medium tracking-normal text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded flex items-center gap-1">
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
                    <h4 className="text-[17px] font-semibold text-themeText tracking-tight mb-1">
                        Happy Birthday! <span className="text-lg">🎉</span>
                    </h4>
                    <p className="text-[10px] text-themeTextSec font-bold tracking-normal">
                        Wishing our Prudentia family a fantastic day
                    </p>
                </div>

                <motion.div 
                    initial="hidden" 
                    animate="visible" 
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="flex flex-col gap-3"
                >
                    {birthdays.map((person, idx) => (
                        <motion.div 
                            key={person.id || idx} 
                            variants={{
                                hidden: { opacity: 0, x: -20 },
                                visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                            }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] px-3 py-2.5 rounded-xl border border-black/5 dark:border-white/10 group hover:border-[#FF2D55]/30 hover:shadow-[0_4px_12px_rgba(255,45,85,0.1)] transition-all cursor-default"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D55]/10 to-[#FF9500]/10 border border-white/20 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {person.profile_picture_url ? (
                                    <img src={person.profile_picture_url} alt={person.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fa-solid fa-user text-xs text-[#FF2D55]/60"></i>
                                )}
                                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-xl pointer-events-none"></div>
                            </div>
                            <div className="flex flex-col text-left pr-2 flex-1">
                                <span className="text-[14px] font-semibold text-themeText leading-tight mb-0.5 group-hover:text-[#FF2D55] transition-colors line-clamp-1">{person.full_name}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec leading-none">{person.role}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all text-[#FF9500] hover:bg-[#FF9500] hover:text-white cursor-pointer" onClick={() => window.erpDialog?.alert(`Sent birthday wishes to ${person.full_name}!`)}>
                                <i className="fa-solid fa-paper-plane text-[10px]"></i>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
