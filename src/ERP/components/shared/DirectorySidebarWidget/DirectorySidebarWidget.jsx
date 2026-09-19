/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';
import defaultAvatar from '../../../../Shared/Assets/LOGOS/pcl_logo.svg';

export default function DirectorySidebarWidget({ role = 'student' }) {
    const { userSession } = useERP();
    const [members, setMembers] = useState([]);
    const [reportingTo, setReportingTo] = useState(null);
    const [isFullViewOpen, setIsFullViewOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        fetchDirectoryData();
    }, [role]);

    const fetchDirectoryData = async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').limit(500);
            if (error) throw error;
            
            const users = data || [];
            setAllUsers(users);

            // Fetch exact mentorship assignments to avoid dummy random matches
            const { data: mentData } = await supabase.from('mentorship').select('faculty_id, student_id');
            const mentorships = mentData || [];

            if (role === 'student') {
                const myMentorAssignment = mentorships.find(m => m.student_id === userSession?.id || m.student_id === userSession?.db_id);
                const mentorProfile = myMentorAssignment ? users.find(u => u.id === myMentorAssignment.faculty_id) : null;
                setReportingTo(mentorProfile || { full_name: 'Unassigned Mentor', role: 'Faculty' });
                
                // Show Faculty members in the Faculty Directory snippet
                const facultyMembers = users.filter(u => u.role === 'faculty' && u.id !== mentorProfile?.id);
                setMembers(facultyMembers.slice(0, 3));
            } else if (role === 'faculty') {
                const admins = users.filter(u => u.role === 'admin');
                setReportingTo(admins[0] || { full_name: 'Prof. Department Head', role: 'Admin' });

                // Exact mentees for this faculty
                const myMenteeIds = mentorships.filter(m => m.faculty_id === userSession?.id).map(m => m.student_id);
                const myMentees = users.filter(u => myMenteeIds.includes(u.id));
                setMembers(myMentees.slice(0, 3));
            } else {
                const admins = users.filter(u => u.role === 'admin' && u.id !== userSession?.id);
                setReportingTo({ full_name: 'Hon. Vice Chancellor', role: 'Leadership' });
                setMembers(admins.slice(0, 3));
            }
        } catch (err) {
            console.error("Error fetching directory:", err);
        }
    };

    const getPresenceStatus = () => null;

    return (
        <>
            {/* SINGLE UNIFIED WIDGET CARD - CLOCK REMOVED & RE-OPTIMIZED */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-2xl flex flex-col relative overflow-hidden"
            >
                {/* 1. Profile Section */}
                <div className="flex flex-col items-center pt-8 pb-6 px-6 relative">
                    
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-black/20 p-1 border border-black/5 dark:border-white/10 overflow-hidden mb-4 shadow-none relative z-10">
                        <img 
                            src={(userSession?.profile_picture_url || userSession?.avatar_url) || defaultAvatar} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <h2 className="text-[15px] font-black text-themeText tracking-tight text-center mt-1 relative z-10">
                        {(userSession?.full_name || userSession?.name) || 'Unknown User'}
                    </h2>
                    <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 relative z-10">
                        {userSession?.role || role}
                    </p>
                </div>

                <div className="w-full h-px bg-black/5 dark:bg-white/5"></div>

                {/* 2. Reporting To Section */}
                <div className="p-5 flex flex-col items-start hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-default">
                    <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-3 ml-1">
                        {role === 'student' ? 'Faculty Mentor' : role === 'faculty' ? 'Reporting To' : 'Leadership'}
                    </p>
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-black/20 p-0.5 border border-black/5 dark:border-white/10 shrink-0 shadow-none">
                            <img src={(reportingTo?.profile_picture_url || reportingTo?.avatar_url) || defaultAvatar} alt="Reporting" className="w-full h-full object-cover rounded-full opacity-90" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[13px] font-bold text-themeText truncate">
                                {(reportingTo?.full_name || reportingTo?.name) || 'Loading...'}
                            </h3>
                            <p className="text-[9px] font-medium text-themeTextSec uppercase tracking-wider truncate mt-0.5">{reportingTo?.role || 'Admin'}</p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-black/5 dark:bg-white/5"></div>

                {/* 3. Department Members Section */}
                <div className="flex flex-col flex-1">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">
                            {role === 'student' ? 'Faculty Directory' : role === 'faculty' ? 'My Mentees' : 'Key Management'}
                        </h3>
                    </div>
                    
                    <div className="flex flex-col pb-2">
                        {members.length > 0 ? members.map((member, idx) => (
                            <div key={idx} className="flex items-center gap-3 px-6 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                <div className="w-9 h-9 rounded-full bg-white dark:bg-black/20 p-0.5 border border-black/5 dark:border-white/10 shrink-0 shadow-none">
                                    <img src={(member.profile_picture_url || member.avatar_url) || defaultAvatar} alt={(member.full_name || member.name)} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-[12px] font-bold text-themeText truncate group-hover:text-themeAccent transition-colors">{(member.full_name || member.name)}</h4>
                                    <p className="text-[9px] font-medium text-themeTextSec uppercase tracking-wider truncate mt-0.5">{member.role}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="px-6 py-6 text-center opacity-50">
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">No members</span>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 mt-auto border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                        <button 
                            onClick={() => setIsFullViewOpen(true)}
                            className="w-full text-center text-[10px] font-black text-themeText hover:text-themeAccent uppercase tracking-widest transition-colors flex items-center justify-center gap-2 py-1"
                        >
                            <i className="fa-solid fa-layer-group"></i> View Full Directory
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isFullViewOpen && (
                    <FullDirectoryModal 
                        onClose={() => setIsFullViewOpen(false)} 
                        allUsers={allUsers}
                        role={role}
                        getPresenceStatus={getPresenceStatus}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

function FullDirectoryModal({ onClose, allUsers, role, getPresenceStatus }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Handle Cmd+K for focusing search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('directory-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const grouped = useMemo(() => {
        let filtered = allUsers;
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = allUsers.filter(u => 
                (u.full_name || u.name || '').toLowerCase().includes(lowerQuery) ||
                (u.role || '').toLowerCase().includes(lowerQuery)
            );
        }

        const groups = {};

        if (role === 'student') {
            // Group 1: Faculty (so students can find their professors)
            groups['Faculty'] = filtered.filter(u => u.role === 'faculty');

            // Group 2: Students (grouped by batch)
            const students = filtered.filter(u => u.role === 'student');
            students.forEach(s => {
                const batch = s.batch_name || 'General Students';
                if (!groups[batch]) groups[batch] = [];
                groups[batch].push(s);
            });
        } else if (role === 'faculty') {
            groups['Fellow Faculty'] = filtered.filter(u => u.role === 'faculty');
            groups['My Mentees'] = filtered.filter(u => u.role === 'student');
        } else {
            // Admin View
            groups['Key Management'] = filtered.filter(u => u.role === 'admin');
            groups['Faculty'] = filtered.filter(u => u.role === 'faculty');
            
            // Sub-categorize students by batch in Admin view!
            const allStudents = filtered.filter(u => u.role === 'student');
            allStudents.forEach(s => {
                const batch = s.batch_name || 'Unassigned Students';
                if (!groups[batch]) groups[batch] = [];
                groups[batch].push(s);
            });
        }
        
        // Filter out empty groups
        return Object.fromEntries(Object.entries(groups).filter(([_, arr]) => arr.length > 0));
    }, [allUsers, role, searchQuery]);

    return ReactDOM.createPortal(
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/40 dark:bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-5xl h-[85vh] bg-themeApp text-themeText shadow-[0_30px_100px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-3xl flex flex-col overflow-hidden relative border border-gray-300 dark:border-white/10"
            >
                {/* Header & Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-6 border-b border-black/5 dark:border-white/5 bg-themeElevated/50 z-40">
                    <div className="flex-1 w-full min-w-0 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl shrink-0">
                            <i className="fa-solid fa-address-book"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Organizational Directory</h2>
                            <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Live Campus Overview</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec text-sm"></i>
                            <input 
                                id="directory-search"
                                type="text"
                                placeholder="Search directory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full py-2.5 pl-10 pr-16 text-sm font-bold focus:outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all placeholder:text-themeTextSec"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <kbd className="hidden sm:inline-block bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded px-1.5 py-0.5 text-[9px] font-black font-sans text-themeTextSec">⌘K</kbd>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 shrink-0 rounded-full bg-black/5 dark:bg-white/5 hover:bg-rose-500 hover:text-gray-900 dark:text-white transition-colors flex items-center justify-center border border-black/5 dark:border-white/10">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Directory Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-themeApp relative z-40">
                    {Object.keys(grouped).length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
                            <i className="fa-solid fa-ghost text-4xl mb-4 text-themeTextSec"></i>
                            <p className="text-sm font-bold uppercase tracking-widest">No members found</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([groupName, users]) => (
                            <div key={groupName} className="mb-10">
                                <h3 className="text-[11px] font-black text-themeText uppercase tracking-widest mb-5 flex items-center gap-4">
                                    {groupName} <span className="text-themeAccent bg-themeAccent/10 px-2.5 py-1 rounded-lg text-[9px]">{users.length}</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-black/10 dark:from-white/10 to-transparent"></div>
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {users.map(u => (
                                        <div key={u.id} className="bg-themeElevated border border-black/5 dark:border-white/5 shadow-none rounded-2xl p-4 flex items-center gap-4 hover:border-themeAccent/30 hover:shadow-none transition-all cursor-pointer group">
                                            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-black/20 p-0.5 border border-black/5 dark:border-white/10 shrink-0 shadow-inner">
                                                <img src={(u.profile_picture_url || u.avatar_url) || defaultAvatar} alt={(u.full_name || u.name)} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-themeText truncate group-hover:text-themeAccent transition-colors">{(u.full_name || u.name) || 'Unknown User'}</h4>
                                                <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest truncate mt-0.5">{u.role}</p>
                                                {u.department && <p className="text-[9px] font-medium text-themeTextSec/70 truncate mt-0.5">{u.department}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
}
