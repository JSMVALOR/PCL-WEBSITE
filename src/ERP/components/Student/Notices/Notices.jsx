/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import FacultyBroadcastForm from "./FacultyBroadcastForm";
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function Notices({ setActiveTab }) {
    const { userSession } = useERP();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [acknowledged, setAcknowledged] = useState(new Set());
    const [saved, setSaved] = useState(new Set());
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Main Tab State
    const [activeMainTab, setActiveMainTab] = useState('broadcasts'); // broadcasts, events
    const [events, setEvents] = useState([]);

    // PRIORITY CONFIG (Match Supabase enum)
    const PRIORITIES = {
        urgent: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: 'fa-triangle-exclamation', display: 'CRITICAL' },
        high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'fa-bolt', display: 'IMPORTANT' },
        normal: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'fa-circle-info', display: 'GENERAL' } };

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                // Fetch Events
                // Fetch Academic Calendar Events
                const { data: acadEvents } = await supabase
                    .from('academic_calendar')
                    .select('*')
                    .gte('start_date', new Date().toISOString().split('T')[0]);
                
                // Fetch Admin Events (Marketing/Public)
                const { data: mktEvents } = await supabase
                    .from('admin_events')
                    .select('*')
                    .gte('event_date', new Date().toISOString().split('T')[0]);

                let unifiedEvents = [];
                if (acadEvents) {
                    unifiedEvents = [...unifiedEvents, ...acadEvents.map(e => ({
                        id: 'acad_' + e.id,
                        title: e.title,
                        description: e.description,
                        start_date: e.start_date,
                        end_date: e.end_date,
                        type: e.type,
                        source: 'academic'
                    }))];
                }
                
                if (mktEvents) {
                    unifiedEvents = [...unifiedEvents, ...mktEvents.map(e => ({
                        id: 'mkt_' + e.id,
                        title: e.title,
                        description: e.description,
                        start_date: e.event_date,
                        end_date: e.event_date,
                        type: 'Public Event',
                        location: e.location,
                        image_url: e.image_url,
                        is_public: e.is_public,
                        source: 'marketing'
                    }))];
                }
                
                // Sort by date ascending
                unifiedEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
                setEvents(unifiedEvents);

                // Fetch Notices
                const { data, error } = await supabase
                    .from('notices')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    const userRole = userSession?.role || 'student';
                    const userBatch = userSession?.academic_batch;
                    const userId = userSession?.id;
                    const userRoleCap = userRole.charAt(0).toUpperCase() + userRole.slice(1);
                    
                    // Filter logic: intersect target array with user properties
                    const applicableNotices = data.filter(n => {
                        if (!n.target_audience || !Array.isArray(n.target_audience) || n.target_audience.length === 0) return true;
                        if (n.target_audience.includes('All')) return true;
                        if (n.target_audience.includes(userRoleCap)) return true;
                        if (userBatch && n.target_audience.includes(userBatch)) return true;
                        if (userId && n.target_audience.includes(userId)) return true;
                        
                        // Always let authors see their own broadcasts
                        if (n.author_id === userId) return true;
                        
                        return false;
                    });

                    // For now, treat all fetched as unread until we link notice_acknowledgements properly
                    setNotices(applicableNotices.map(n => ({ ...n, isUnread: true })));
                    
                    // Fetch acknowledgements for this user
                    if (userSession?.id) {
                        const { data: ackData } = await supabase
                            .from('notice_acknowledgements')
                            .select('notice_id')
                            .eq('user_id', userSession.db_id);
                            
                        if (ackData) {
                            setAcknowledged(new Set(ackData.map(a => a.notice_id)));
                        }
                    }
                } else {
                    setNotices([]);
                }
            } catch (err) {
                console.error("Failed to fetch notices:", err);
                setNotices([]);
            }
            setLoading(false);
        };
        fetchNotices();
    }, [userSession]);

    const toggleSave = (id, e) => {
        e.stopPropagation();
        const next = new Set(saved);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSaved(next);
    };

    const handleAcknowledge = async (id) => {
        if (!userSession?.id) return;
        
        try {
            await supabase.from('notice_acknowledgements').insert([{
                notice_id: id,
                user_id: userSession.db_id
            }]);
            
            const next = new Set(acknowledged);
            next.add(id);
            setAcknowledged(next);
            
            // Remove unread dot visually
            setNotices(notices.map(n => n.id === id ? { ...n, isUnread: false } : n));
        } catch (err) {
            console.error("Ack failed", err);
        }
    };

    // Filter Logic
    let filtered = notices.filter(n => {
        if (activeFilter === 'Unread') return n.isUnread;
        if (activeFilter === 'Pinned') return n.is_pinned;
        if (activeFilter === 'Saved') return saved.has(n.id);
        if (activeFilter !== 'All' && n.category !== activeFilter) return false;
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
        }
        return true;
    });

    const renderFeed = () => (
        <div className="flex flex-col gap-4 pb-12">
            {filtered.length === 0 ? (
                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-[30px] border border-black/10 dark:border-white/20 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center opacity-50 shadow-inner">
                    <i className="fa-regular fa-folder-open text-4xl mb-4 text-themeTextSec"></i>
                    <p className="text-sm font-bold text-themeTextSec tracking-normal">No notices found</p>
                </div>
            ) : filtered.map((notice, i) => {
                const pConf = PRIORITIES[notice.priority] || PRIORITIES.normal;
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        key={notice.id} 
                        onClick={() => {
                            setSelectedNotice(notice);
                            setNotices(notices.map(n => n.id === notice.id ? { ...n, isUnread: false } : n));
                        }}
                        className={`bg-black/5 dark:bg-white/5 backdrop-blur-[30px] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border ${notice.isUnread ? 'border-black/5 dark:border-white/10' : 'border-black/10 dark:border-white/20'} hover:bg-white/10 rounded-[1.5rem] p-6 cursor-pointer flex flex-col group relative overflow-hidden`}
                    >
                        {/* Specular Highlight */}
                        {/* Glow effect for unread/pinned */}
                        {notice.isUnread && <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${pConf.bg} shadow-[0_0_15px_${pConf.bg.split('/')[0].replace('bg-','')}]`}></div>}
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="flex items-center gap-3">
                                {notice.is_pinned && <motion.i initial={{ rotate: 0 }} animate={{ rotate: 45 }} className="fa-solid fa-thumbtack text-[12px] text-themeAccent"></motion.i>}
                                <span className={`px-2 py-1 rounded-full text-[12px] font-medium ${pConf.bg} ${pConf.color} border border-black/5 dark:border-white/10 shadow-inner`}>
                                    <i className={`fa-solid ${pConf.icon} mr-1.5`}></i>
                                    {pConf.display}
                                </span>
                                <span className="text-[11px] font-bold text-[#8E8E93] bg-black/5 dark:bg-white/10 px-3 py-1 rounded-md border border-black/5 dark:border-white/5">{notice.category}</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="text-[10px] font-bold text-themeTextSec tracking-normal">{new Date(notice.created_at).toLocaleDateString()}</span>
                                <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={(e) => toggleSave(notice.id, e)} className={`text-base transition-colors ${saved.has(notice.id) ? 'text-amber-400' : 'text-themeTextSec hover:text-themeText'}`}>
                                    <i className={`${saved.has(notice.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                                </motion.button>
                            </div>
                        </div>

                        <h3 className={`text-xl font-semibold tracking-tight tracking-tight mb-2 relative z-10 drop-shadow-sm ${notice.isUnread ? 'text-themeText' : 'text-themeTextSec'}`}>
                            {notice.title}
                            {notice.isUnread && <span className="inline-block w-2.5 h-2.5 rounded-full bg-themeAccent ml-3 mb-1 animate-pulse shadow-[0_0_10px_var(--theme-accent)]"></span>}
                        </h3>
                        <p className="text-sm font-bold text-themeTextSec/80 line-clamp-2 leading-relaxed relative z-10">{notice.summary}</p>

                        {/* Quick Action Footer */}
                        <div className="mt-5 flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-4 opacity-50 group-hover:opacity-100 transition-opacity relative z-10">
                            <span className="text-[13px] font-medium text-themeAccent">Read Full Notice →</span>
                            {(notice.requires_acknowledgement && !acknowledged.has(notice.id)) && (
                                <span className="text-[12px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full shadow-inner">Action Required</span>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderEventsFeed = () => (
        <div className="flex flex-col gap-4 pb-12">
            {events.length === 0 ? (
                <div className="bg-black/5 dark:bg-white/5 backdrop-blur-[30px] border border-black/10 dark:border-white/20 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center opacity-50 shadow-inner">
                    <i className="fa-regular fa-calendar-xmark text-4xl mb-4 text-themeTextSec"></i>
                    <p className="text-sm font-bold text-themeTextSec tracking-normal">No upcoming events</p>
                </div>
            ) : events.map((e, i) => (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                    whileHover={{ scale: 1.01 }}
                    key={e.id} 
                    className="bg-black/5 dark:bg-white/5 backdrop-blur-[30px] shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-black/10 dark:border-white/20 hover:border-black/5 dark:border-white/10 rounded-[2rem] p-6 flex items-center justify-between group relative overflow-hidden"
                >
                    <div className="flex gap-6 items-center relative z-10">
                        <div className="w-24 h-24 rounded-[1.5rem] bg-gray-50 dark:bg-black/20 dark:bg-white/10 backdrop-blur-md shadow-inner border border-black/5 dark:border-white/10 flex flex-col items-center justify-center shrink-0 group-hover:bg-themeAccent/10 group-hover:border-themeAccent/30 transition-colors">
                            <span className="text-[13px] font-medium text-themeAccent drop-shadow-sm">{new Date(e.start_date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-4xl font-black text-themeText leading-none mt-1">{new Date(e.start_date).getDate()}</span>
                        </div>
                        <div>
                            <div className="flex gap-2 mb-2">
                                <span className="text-[11px] font-bold text-[#8E8E93] bg-black/5 dark:bg-white/10 px-3 py-1 rounded-md border border-black/5 dark:border-white/5">
                                    {e.event_type}
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold tracking-tight text-themeText drop-shadow-sm">{e.title}</h3>
                            <p className="text-sm font-bold text-themeTextSec/80 mt-1 line-clamp-2">{e.description}</p>
                            {e.end_date && e.end_date !== e.start_date && (
                                <p className="text-[13px] font-medium text-themeTextSec mt-3 flex items-center gap-2">
                                    <i className="fa-solid fa-arrow-right-long text-themeAccent"></i>
                                    Ends {new Date(e.end_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const renderDetailView = () => {
        const pConf = PRIORITIES[selectedNotice.priority] || PRIORITIES.normal;
        const needsAck = selectedNotice.requires_acknowledgement && !acknowledged.has(selectedNotice.id);
        const sanitize = window.DOMPurify ? window.DOMPurify.sanitize : (s) => s;

        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex-1 flex flex-col bg-white/5 backdrop-blur-[40px] shadow-[0_15px_50px_0_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden relative"
            >
                {/* Edge Specular */}
                {/* Header Area */}
                <div className="p-8 lg:p-10 border-b border-black/5 dark:border-white/10 relative overflow-hidden bg-black/10 dark:bg-white/5">
                    <div className={`absolute top-0 right-0 w-full max-w-[20rem] h-[20rem] bg-gradient-to-br ${pConf.bg} to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-[100px] opacity-70`}></div>
                    
                    <motion.button 
                        whileHover={{ x: -5 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedNotice(null)} 
                        className="mb-8 text-[13px] font-medium text-themeTextSec hover:text-themeText transition-colors flex items-center gap-2 relative z-10"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Board
                    </motion.button>

                    <div className="flex items-center gap-3 mb-5 relative z-10">
                        <span className={`px-3 py-1.5 rounded-full text-[12px] font-medium ${pConf.bg} ${pConf.color} border border-black/5 dark:border-white/10 shadow-inner`}>
                            {pConf.display}
                        </span>
                        <span className="text-[13px] font-medium text-themeTextSec bg-gray-50 dark:bg-black/20 dark:bg-white/10 backdrop-blur-md shadow-inner px-3 py-1.5 rounded-full border border-black/10 dark:border-white/20">{selectedNotice.category}</span>
                        <span className="text-[10px] font-bold text-themeTextSec tracking-normal ml-2 opacity-70">Published: {new Date(selectedNotice.created_at).toLocaleDateString()}</span>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-black text-themeText tracking-tight mb-3 relative z-10 leading-tight">{selectedNotice.title}</h1>
                    <p className="text-sm font-bold text-themeTextSec/90 relative z-10 leading-relaxed max-w-3xl">{selectedNotice.summary}</p>
                </div>

                {/* Content Area */}
                <div className="p-8 lg:p-10 flex-1 overflow-y-auto custom-scrollbar prose prose-invert prose-p:text-themeTextSec prose-p:font-bold prose-headings:font-black prose-a:text-themeAccent max-w-none relative z-10">
                    <div dangerouslySetInnerHTML={{ __html: sanitize(selectedNotice.content) }}></div>
                </div>

                {/* Footer / Actions Area */}
                <div className="p-8 border-t border-black/5 dark:border-white/10 bg-gray-50 dark:bg-black/20 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 backdrop-blur-md">
                    
                    <div className="flex gap-3">
                        {selectedNotice.deep_link_url && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(selectedNotice.deep_link_url)} className="bg-white/10 backdrop-blur-md shadow-inner border border-black/5 dark:border-white/10 hover:border-themeAccent hover:text-themeAccent text-themeText px-5 py-3 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-link"></i> Go to Portal
                            </motion.button>
                        )}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Development in Progress: This module is scheduled for Phase 2 deployment."); }} className="bg-white/10 backdrop-blur-md shadow-inner border border-black/5 dark:border-white/10 hover:border-white/30 text-themeTextSec hover:text-themeText px-5 py-3 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2">
                            <i className="fa-solid fa-paperclip"></i> Download Attachments
                        </motion.button>
                    </div>

                    {selectedNotice.requires_acknowledgement ? (
                        <motion.button 
                            whileHover={needsAck ? { scale: 1.05 } : {}}
                            whileTap={needsAck ? { scale: 0.95 } : {}}
                            onClick={() => handleAcknowledge(selectedNotice.id)}
                            disabled={!needsAck}
                            className={`px-8 py-3 rounded-xl text-[13px] font-medium transition-all shadow-lg flex items-center gap-2 ${
                                needsAck 
                                    ? 'bg-rose-500 text-gray-900 dark:text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed shadow-inner'
                            }`}
                        >
                            {needsAck ? (
                                <><i className="fa-regular fa-square-check text-sm"></i> I HAVE READ THIS NOTICE</>
                            ) : (
                                <><i className="fa-solid fa-check-double text-sm"></i> ACKNOWLEDGED</>
                            )}
                        </motion.button>
                    ) : null}
                    
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full h-auto xl:h-[calc(100vh-9rem)] xl:min-h-[600px] min-h-full relative flex-1 bg-transparent text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
            
            <div className="relative z-20 w-full w-full mx-auto flex flex-col gap-4 lg:gap-8 h-full p-2 sm:p-4 lg:p-8 overflow-hidden">
                
                {/* Header Container */}
            <PageHeader 
                icon="fa-solid fa-bullhorn"
                title="Notice Board"
                subtitle="Official communication & events."
                rightContent={
                    <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
                        <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl border border-black/5 dark:border-white/5 w-full md:w-auto">
                            <button type="button" 
                                onClick={() => {setActiveMainTab('broadcasts'); setSelectedNotice(null); setIsBroadcasting(false);}} 
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[12px] font-bold tracking-tight transition ${activeMainTab === "broadcasts" ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F2F2F7] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}
                            >
                                Notices
                            </button>
                            <button type="button" 
                                onClick={() => {setActiveMainTab('events'); setSelectedNotice(null); setIsBroadcasting(false);}} 
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[12px] font-bold tracking-tight transition ${activeMainTab === "events" ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F2F2F7] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}
                            >
                                Events
                            </button>
                        </div>
                        
                        {activeMainTab === "broadcasts" && (
                            <div className="relative flex-1 md:w-64 w-full">
                                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93] text-[13px]"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search notices..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 focus:border-[#007AFF]/50 focus:bg-white dark:focus:bg-[#2C2C2E] rounded-xl pl-9 pr-4 py-2 text-[13px] font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-[#8E8E93] outline-none transition-all shadow-inner"
                                />
                            </div>
                        )}

                        {(userSession?.role === 'admin') && !isBroadcasting && activeMainTab === 'events' && (
                            <button type="button" 
                                onClick={() => setActiveTab && setActiveTab('events')} 
                                className="px-5 py-2 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 rounded-xl text-[12px] font-bold tracking-tight transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                                <i className="fa-solid fa-calendar-plus"></i> Manage Events
                            </button>
                        )}
                        {(userSession?.role === 'faculty' || userSession?.role === 'admin') && !isBroadcasting && activeMainTab === 'broadcasts' && (
                            <button type="button" 
                                onClick={() => setIsBroadcasting(true)} 
                                className="px-5 py-2 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 rounded-xl text-[12px] font-bold tracking-tight transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
                            >
                                <i className="fa-solid fa-satellite-dish"></i> Broadcast
                            </button>
                        )}
                    </div>
                }
            />

            {/* Content Area */}
                <div className="flex flex-col xl:flex-row gap-8 h-full overflow-hidden">
                    
                    {/* LEFT: Feed or Detail */}
                    <div className="flex-1 w-full flex flex-col gap-6 h-full overflow-hidden">
                        
                        {/* Filters Bar */}
                        <AnimatePresence>
                            {activeMainTab === "broadcasts" && !selectedNotice && !isBroadcasting && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-wrap gap-2 shrink-0"
                                >
                                    {['All', 'Unread', 'Pinned', 'Saved', 'Academic', 'Emergency'].map(f => (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            key={f}
                                            onClick={() => setActiveFilter(f)}
                                            className={`px-5 py-2 rounded-xl text-[12px] font-bold tracking-tight transition-all border ${
                                                activeFilter === f 
                                                    ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-[#F2F2F7] border-black/5 dark:border-white/10 shadow-sm scale-105' 
                                                    : 'bg-black/5 dark:bg-white/10 text-[#8E8E93] border-transparent hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] hover:border-black/5 dark:hover:border-gray-300 dark:border-white/10'
                                            }`}
                                        >
                                            {f}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scrolling Content Feed */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
                            <AnimatePresence mode="wait">
                                {activeMainTab === "events" ? (
                                    <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                        {renderEventsFeed()}
                                    </motion.div>
                                ) : isBroadcasting ? (
                                    <motion.div key="broadcast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="bg-white/5 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-3xl md:rounded-[2rem] p-0 sm:p-4 md:p-8 overflow-hidden">
                                        <FacultyBroadcastForm 
                                            onCancel={() => setIsBroadcasting(false)}
                                            onNoticePublished={() => { setIsBroadcasting(false); window.location.reload(); }}
                                        />
                                    </motion.div>
                                ) : selectedNotice ? (
                                    <motion.div key="detail" className="h-full flex flex-col">
                                        {renderDetailView()}
                                    </motion.div>
                                ) : (
                                    <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                        {renderFeed()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RIGHT: Sidebar Stats/Info */}
                    <AnimatePresence>
                        {!selectedNotice && !isBroadcasting && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="hidden xl:flex flex-col w-full max-w-[22rem] shrink-0 gap-4 h-full overflow-hidden pb-2"
                            >
                                {/* Summary Card */}
                                <div className="bg-white/5 backdrop-blur-[40px] border border-black/5 dark:border-white/10 rounded-[2rem] p-5 shadow-none relative overflow-hidden group shrink-0">
                                    <h3 className="text-[13px] font-medium text-themeTextSec mb-4 flex items-center gap-2"><i className="fa-solid fa-chart-simple text-themeAccent"></i> Your Summary</h3>
                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-3xl font-semibold tracking-tight text-themeText">{notices.filter(n => n.isUnread).length}</span>
                                            <span className="text-[11px] font-medium text-themeTextSec">Unread</span>
                                        </div>
                                        <div className="flex flex-col gap-1 items-center border-x border-black/5 dark:border-white/10">
                                            <span className="text-3xl font-semibold tracking-tight text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">{saved.size}</span>
                                            <span className="text-[11px] font-medium text-themeTextSec">Saved</span>
                                        </div>
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="text-3xl font-semibold tracking-tight text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">{notices.filter(n => n.requires_acknowledgement && !acknowledged.has(n.id)).length}</span>
                                            <span className="text-[11px] font-medium text-rose-400/80 text-center leading-tight">Action<br/>Required</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Policies Card */}
                                <div className="bg-white/5 backdrop-blur-[40px] border border-black/5 dark:border-white/10 rounded-[2rem] p-5 shadow-none relative overflow-hidden shrink-0">
                                    <h3 className="text-[13px] font-medium text-themeTextSec mb-4"><i className="fa-solid fa-shield-halved mr-2 text-themeAccent opacity-70"></i> Notice Policies</h3>
                                    <div className="flex flex-col gap-3 relative z-10">
                                        <div className="flex gap-3 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl shadow-inner items-start">
                                            <i className="fa-solid fa-circle-exclamation mt-0.5 text-rose-400 text-[11px]"></i>
                                            <p className="text-[9px] font-bold text-rose-400/90 leading-relaxed uppercase tracking-wide">
                                                CRITICAL notices require mandatory digital acknowledgement.
                                            </p>
                                        </div>
                                        <div className="flex gap-3 bg-gray-50 dark:bg-black/20 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 rounded-xl shadow-inner items-start">
                                            <i className="fa-solid fa-clock-rotate-left mt-0.5 text-themeTextSec text-[11px]"></i>
                                            <p className="text-[9px] font-bold text-themeTextSec leading-relaxed uppercase tracking-wide">
                                                Expired notices remain available via search for 1 academic year.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}