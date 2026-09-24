import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import { formatDistanceToNow, format } from 'date-fns';
import PageHeader from '../PageHeader/PageHeader';

export default function NotificationsCenter({ setActiveTab }) {
    const { userSession, unreadNotifications, setUnreadNotifications, universalNotifications = [], setUniversalNotifications } = useERP();
    const [activeFilter, setActiveFilter] = useState('All'); // All, Unread, Read



    const markAsRead = async (id) => {
        try {
            const notif = universalNotifications.find(n => n.id === id);
            if (!notif) return;

            if (notif.source === 'system') {
                await supabase.from('notifications').update({ is_read: true }).eq('id', id);
            } else if (notif.source === 'mentorship_messages') {
                await supabase.from('mentorship_messages').update({ read_at: new Date().toISOString() }).eq('id', notif.original_id);
            } else if (notif.source === 'mentorship_meetings') {
                const readMeetings = JSON.parse(localStorage.getItem('read_meetings') || '[]');
                if (!readMeetings.includes(notif.original_id)) {
                    readMeetings.push(notif.original_id);
                    localStorage.setItem('read_meetings', JSON.stringify(readMeetings));
                }
            }
            
            setUniversalNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadNotifications(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const systemUnread = universalNotifications.filter(n => !n.is_read && n.source === 'system').map(n => n.id);
            const msgUnread = universalNotifications.filter(n => !n.is_read && n.source === 'mentorship_messages').map(n => n.original_id);
            const meetingUnread = universalNotifications.filter(n => !n.is_read && n.source === 'mentorship_meetings').map(n => n.original_id);
            
            if (systemUnread.length > 0) {
                await supabase.from('notifications').update({ is_read: true }).in('id', systemUnread);
            }
            if (msgUnread.length > 0) {
                await supabase.from('mentorship_messages').update({ read_at: new Date().toISOString() }).in('id', msgUnread);
            }
            if (meetingUnread.length > 0) {
                const readMeetings = JSON.parse(localStorage.getItem('read_meetings') || '[]');
                const updatedMeetings = [...new Set([...readMeetings, ...meetingUnread])];
                localStorage.setItem('read_meetings', JSON.stringify(updatedMeetings));
            }
            
            setUniversalNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadNotifications(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const filteredNotifications = universalNotifications.filter(n => {
        if (activeFilter === 'Unread') return !n.is_read;
        if (activeFilter === 'Read') return n.is_read;
        return true;
    });

    const getIconForType = (type) => {
        switch (type) {
            case 'message': return { icon: 'fa-message', color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'leave': return { icon: 'fa-plane-departure', color: 'text-amber-500', bg: 'bg-amber-500/10' };
            case 'meeting': return { icon: 'fa-calendar-check', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'attendance': return { icon: 'fa-user-clock', color: 'text-rose-500', bg: 'bg-rose-500/10' };
            default: return { icon: 'fa-bell', color: 'text-themeAccent', bg: 'bg-themeAccent/10' };
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in relative z-10 max-w-[1600px] mx-auto w-full">
            <PageHeader 
                icon="fa-solid fa-bell" 
                title="Notification Center" 
                subtitle="Manage all your alerts and updates"
                action={
                    <button 
                        onClick={markAllAsRead}
                        disabled={universalNotifications.filter(n => !n.is_read).length === 0}
                        className="px-4 py-2 bg-themeElevated hover:bg-themeElevated/80 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-themeText transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-check-double"></i>
                        Mark All as Read
                    </button>
                }
            />

            <div className="flex-1 p-6 pb-24 overflow-y-auto min-h-0 relative space-y-6">
                
                {/* Filters */}
                <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl w-fit">
                    {['All', 'Unread', 'Read'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${activeFilter === filter ? 'bg-white dark:bg-themeElevated text-themeText shadow-sm' : 'text-themeTextSec hover:text-themeText'}`}
                        >
                            {filter}
                            {filter === 'Unread' && unreadNotifications > 0 && (
                                <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadNotifications}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex flex-col gap-3">
                    {universalNotifications.length === 0 && unreadNotifications > 0 ? (
                        <div className="flex justify-center p-12">
                            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeTextSec"></i>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-themeTextSec gap-4">
                            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                <i className="fa-regular fa-bell-slash text-3xl"></i>
                            </div>
                            <h3 className="text-sm font-bold">No {activeFilter.toLowerCase()} notifications</h3>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map(n => {
                                const style = getIconForType(n.type);
                                return (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border transition-colors ${!n.is_read ? 'bg-themeElevated border-themeAccent/20' : 'bg-transparent border-black/5 dark:border-white/5'}`}
                                    >
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${style.bg}`}>
                                            <i className={`fa-solid ${style.icon} ${style.color}`}></i>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-[14px] font-bold truncate ${!n.is_read ? 'text-themeText' : 'text-themeTextSec'}`}>{n.title}</h4>
                                                {!n.is_read && <span className="w-2 h-2 rounded-full bg-themeAccent shrink-0"></span>}
                                            </div>
                                            <p className="text-[13px] text-themeTextSec/80 leading-relaxed">{n.message}</p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5 shrink-0">
                                            <span className="text-[11px] font-black text-themeTextSec/60 uppercase tracking-widest flex-1 sm:flex-none text-left sm:text-right">
                                                {format(new Date(n.created_at), 'dd MMM, hh:mm a')}
                                            </span>
                                            
                                            {n.action_link && (
                                                <button
                                                    onClick={() => {
                                                        if (!n.is_read) markAsRead(n.id);
                                                        setActiveTab(n.action_link);
                                                    }}
                                                    className="px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-themeAccent hover:text-white rounded-lg text-xs font-bold text-themeText transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            )}

                                            {!n.is_read && (
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-themeTextSec hover:text-themeText transition-colors tooltip-trigger"
                                                    title="Mark as Read"
                                                >
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
