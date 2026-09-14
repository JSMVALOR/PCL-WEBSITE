/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizationDirectory() {
    const [members, setMembers] = useState({ faculty: [], student: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('faculty');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDirectory();
    }, []);

    const fetchDirectory = async () => {
        setIsLoading(true);
        try {
            // Fetch all active profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, profile_picture_url, phone_number')
                .in('role', ['faculty', 'student'])
                .order('full_name', { ascending: true });

            if (error) throw error;

            const directory = { faculty: [], student: [] };
            if (data) {
                data.forEach(user => {
                    if (user.role === 'faculty') directory.faculty.push(user);
                    if (user.role === 'student') directory.student.push(user);
                });
            }
            setMembers(directory);
        } catch (error) {
            console.error("Failed to fetch organization directory:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = members[activeTab].filter(member => 
        (member.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.erp_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full flex flex-col gap-6 relative z-10">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl backdrop-blur-xl border border-black/5 dark:border-white/10 shrink-0">
                    <button 
                        onClick={() => setActiveTab('faculty')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'faculty' ? 'bg-white dark:bg-[#1C1C1E] text-[#007AFF] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
                        }`}
                    >
                        Faculty ({members.faculty.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('student')}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'student' ? 'bg-white dark:bg-[#1C1C1E] text-[#007AFF] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'
                        }`}
                    >
                        Students ({members.student.length})
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93] text-sm"></i>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search directory..."
                        className="w-full bg-white/50 dark:bg-[#1C1C1E]/50 backdrop-blur-xl border border-black/10 dark:border-white/10 focus:border-[#007AFF] rounded-lg py-2.5 pl-9 pr-4 text-xs font-bold text-[#1C1C1E] dark:text-[#F2F2F7] outline-none transition-colors shadow-inner"
                    />
                </div>
            </div>

            {/* Directory Grid */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-[#8E8E93]">
                        <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-[#8E8E93] gap-3">
                        <i className="fa-regular fa-address-book text-4xl opacity-50"></i>
                        <p className="text-xs font-bold uppercase tracking-widest">No members found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredMembers.map((member) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    key={member.id}
                                    className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-5 flex items-center gap-4 group"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 shadow-inner overflow-hidden flex items-center justify-center shrink-0">
                                        {member.profile_picture_url ? (
                                            <img src={member.profile_picture_url} alt={member.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-black text-[#8E8E93]">
                                                {member.full_name ? member.full_name.substring(0,2).toUpperCase() : 'US'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h4 className="text-[14px] font-bold text-[#1C1C1E] dark:text-[#F2F2F7] truncate tracking-tight mb-0.5">
                                            {member.full_name || 'Unknown User'}
                                        </h4>
                                        {member.erp_id && (
                                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#007AFF] mb-1.5">
                                                {member.erp_id}
                                            </p>
                                        )}
                                        <div className="flex flex-col gap-1 text-[11px] font-medium text-[#8E8E93]">
                                            <div className="flex items-center gap-2 truncate">
                                                <i className="fa-solid fa-envelope w-3"></i>
                                                <span className="truncate">{member.email || 'No email provided'}</span>
                                            </div>
                                            {(member.department || member.phone_number) && (
                                                <div className="flex items-center gap-2 truncate">
                                                    <i className="fa-solid fa-building w-3"></i>
                                                    <span className="truncate">{member.department || member.phone_number}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
