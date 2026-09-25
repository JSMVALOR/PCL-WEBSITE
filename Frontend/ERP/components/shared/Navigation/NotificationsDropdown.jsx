/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsDropdown({ onClose, setActiveTab }) {
    const { userSession, universalNotifications = [] } = useERP();
    const [isLoading, setIsLoading] = useState(false);



    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-[calc(100%-8px)] right-0 pt-2 z-[999999] origin-top-right"
        >
            <div className="bg-white dark:bg-themePanel border border-black/[0.04] dark:border-white/[0.08] shadow-[0_20px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.4)] rounded-2xl w-[320px] flex flex-col relative overflow-hidden">
                <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                    <h3 className="text-[13px] font-bold text-themeText tracking-tight">Notifications</h3>
                    <span className="text-[10px] font-black text-themeTextSec bg-black/5 dark:bg-white/10 px-2 py-1 rounded-md">{universalNotifications.filter(n => !n.is_read).length} New</span>
                </div>

                <div className="flex flex-col max-h-[360px] overflow-y-auto overscroll-contain">
                    {isLoading ? (
                        <div className="p-8 flex justify-center items-center text-themeTextSec">
                            <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
                        </div>
                    ) : universalNotifications.filter(n => !n.is_read).length === 0 ? (
                        <div className="p-8 flex flex-col justify-center items-center text-themeTextSec gap-3">
                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <i className="fa-regular fa-bell-slash text-xl"></i>
                            </div>
                            <span className="text-xs font-bold tracking-tight text-center">You're all caught up!</span>
                        </div>
                    ) : (
                                                universalNotifications.filter(n => !n.is_read).slice(0, 5).map((n, i) => {
                            const iconMap = {
                                message: { icon: 'fa-regular fa-message text-blue-500', bg: 'bg-blue-500/10' },
                                meeting: { icon: 'fa-regular fa-calendar-check text-emerald-500', bg: 'bg-emerald-500/10' },
                                leave: { icon: 'fa-solid fa-plane-departure text-amber-500', bg: 'bg-amber-500/10' },
                                attendance: { icon: 'fa-solid fa-user-clock text-rose-500', bg: 'bg-rose-500/10' },
                                system: { icon: 'fa-solid fa-bell text-themeAccent', bg: 'bg-themeAccent/10' }
                            };
                            const style = iconMap[n.type] || iconMap.system;
                            
                            return (
                                <button 
                                    key={n.id + i}
                                    onClick={() => {
                                        n.action_link ? setActiveTab(n.action_link) : setActiveTab('dashboard');
                                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                                        onClose();
                                    }}
                                    className="flex items-start gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 border-b border-black/5 dark:border-white/5 transition-colors text-left"
                                >
                                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${style.bg}`}>
                                        <i className={`${style.icon} text-sm`}></i>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-[12px] font-bold text-themeText tracking-tight truncate">{n.title}</span>
                                        <span className="text-[11px] text-themeTextSec mt-0.5 leading-snug truncate">{n.message}</span>
                                        <span className="text-[9px] font-black text-themeTextSec/60 uppercase tracking-widest mt-2">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="p-2 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5">
                    <button 
                        onClick={() => {
                            setActiveTab('notifications');
                            onClose();
                        }}
                        className="w-full py-2 text-center text-[11px] font-bold text-themeAccent hover:bg-themeAccent/10 rounded-lg transition-colors"
                    >
                        View All Notifications
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
