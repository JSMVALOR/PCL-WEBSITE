/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_BATCHES = ['BBA.LLB (2026-31)', 'BA.LLB (2026-31)', 'LLB (2026-29)'];

export default function TargetAudienceSelector({ value, onChange, role = 'admin' }) {
    // Determine initial mode based on value
    let initialMode = 'Global';
    if (value.length > 0 && !value.includes('All')) {
        if (value.some(v => ['Student', 'Faculty', 'Staff', 'Alumni'].includes(v))) {
            initialMode = 'Roles';
        } else if (value.some(v => MOCK_BATCHES.includes(v))) {
            initialMode = 'Batches';
        } else {
            initialMode = 'Individual';
        }
    }

    const [mode, setMode] = useState(initialMode); 
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Sync 'All' when mode is Global
    useEffect(() => {
        if (mode === 'Global' && (!value.includes('All') || value.length > 1)) {
            onChange(['All']);
        }
    }, [mode, onChange, value]);

    // Handle search for individuals
    useEffect(() => {
        const fetchUsers = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, erp_id, full_name, role, academic_batch')
                .or(`full_name.ilike.%${searchTerm}%,erp_id.ilike.%${searchTerm}%`)
                .limit(5);
            
            if (!error && data) setSearchResults(data);
            setIsSearching(false);
        };

        const timer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const toggleItem = (item) => {
        if (value.includes(item)) {
            onChange(value.filter(v => v !== item));
        } else {
            onChange([...value.filter(v => v !== 'All'), item]); // Remove 'All' if selecting specific
        }
    };

    const handleSelectIndividual = (erpId) => {
        if (!value.includes(erpId)) {
            onChange([...value.filter(v => v !== 'All'), erpId]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const modes = role === 'admin' ? ['Global', 'Roles', 'Batches', 'Individual'] : ['Batches', 'Individual'];

    return (
        <div className="flex flex-col gap-3">
            {/* iOS Segmented Control */}
            <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-xl backdrop-blur-xl border border-black/5 dark:border-white/5 relative">
                {modes.map(m => (
                    <button 
                        key={m}
                        type="button" 
                        onClick={() => setMode(m)} 
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all relative z-10 ${mode === m ? 'text-[#1C1C1E] dark:text-[#F2F2F7] shadow-sm' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7]'}`}
                    >
                        {mode === m && (
                            <motion.div 
                                layoutId="targetAudienceMode"
                                className="absolute inset-0 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-lg shadow-[0_2px_8px_rgb(0,0,0,0.04)] -z-10"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        {m}
                    </button>
                ))}
            </div>

            {/* Selection Area */}
            <div className="min-h-[100px] bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-5 flex flex-col gap-2 justify-center relative">
                <AnimatePresence mode="wait">
                    
                    {mode === 'Global' && (
                        <motion.div 
                            key="Global"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <i className="fa-solid fa-earth-americas text-3xl bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] to-[#5AC8FA] mb-3"></i>
                            <h4 className="text-[15px] font-bold text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight">Global Broadcast</h4>
                            <p className="text-[11px] font-medium text-[#8E8E93] mt-1">Sent to all registered users across the platform.</p>
                        </motion.div>
                    )}

                    {mode === 'Roles' && (
                        <motion.div key="Roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2 justify-center">
                            {['Student', 'Faculty', 'Staff', 'Alumni'].map(r => (
                                <button 
                                    type="button"
                                    key={r} 
                                    onClick={() => toggleItem(r)}
                                    className={`px-4 py-2 rounded-xl text-[12px] font-bold tracking-tight transition-all border ${value.includes(r) ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-md shadow-[#007AFF]/20' : 'bg-black/5 dark:bg-white/10 text-[#3A3A3C] dark:text-[#EBEBF5]/60 border-black/5 dark:border-white/5 hover:border-[#007AFF]/30'}`}
                                >
                                    {r}s
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {mode === 'Batches' && (
                        <motion.div key="Batches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2 justify-center">
                            {MOCK_BATCHES.map(b => (
                                <button 
                                    type="button"
                                    key={b} 
                                    onClick={() => toggleItem(b)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all border ${value.includes(b) ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-md shadow-[#007AFF]/20' : 'bg-black/5 dark:bg-white/10 text-[#3A3A3C] dark:text-[#EBEBF5]/60 border-black/5 dark:border-white/5 hover:border-[#007AFF]/30'}`}
                                >
                                    {b}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {mode === 'Individual' && (
                        <motion.div key="Individual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full max-w-sm mx-auto gap-3">
                            {/* Currently Selected Individuals */}
                            {value.filter(v => v !== 'All' && !MOCK_BATCHES.includes(v) && !['Student','Faculty','Staff','Alumni'].includes(v)).length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center mb-2">
                                    {value.filter(v => v !== 'All' && !MOCK_BATCHES.includes(v) && !['Student','Faculty','Staff','Alumni'].includes(v)).map(v => (
                                        <div key={v} className="flex items-center gap-2 bg-[#007AFF]/10 text-[#007AFF] px-3 py-1.5 rounded-lg border border-[#007AFF]/20 text-[11px] font-bold tracking-tight">
                                            <span>{v}</span>
                                            <button type="button" onClick={() => toggleItem(v)} className="hover:text-rose-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Input */}
                            <p className="text-[11px] font-medium text-[#8E8E93] mb-2 text-center w-full">Private Message via Notice Board</p>
                            <div className="relative w-full">
                                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search by Name or ERP ID..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 focus:border-[#007AFF]/50 focus:bg-white dark:focus:bg-[#2C2C2E] rounded-xl pl-10 pr-4 py-3 text-[13px] font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] placeholder:text-[#8E8E93] outline-none focus:ring-0 focus:outline-none transition-all shadow-inner"
                                />
                                {isSearching && <i className="fa-solid fa-spinner fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-[#007AFF]"></i>}
                                
                                {/* Search Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-[100] flex flex-col shadow-2xl">
                                        {searchResults.map(user => (
                                            <button 
                                                type="button"
                                                key={user.id}
                                                onClick={() => handleSelectIndividual(user.erp_id)}
                                                className="flex flex-col text-left p-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-b border-black/5 dark:border-white/5 last:border-b-0"
                                            >
                                                <span className="text-[13px] font-bold text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight">{user.full_name}</span>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#007AFF] bg-[#007AFF]/10 px-1.5 py-0.5 rounded">{user.erp_id}</span>
                                                    <span className="text-[10px] font-semibold text-[#8E8E93] uppercase">{user.role}</span>
                                                    {user.academic_batch && <span className="text-[10px] font-semibold text-[#8E8E93] truncate max-w-[100px]">• {user.academic_batch}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
