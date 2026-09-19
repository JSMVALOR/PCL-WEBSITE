import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';

export default function StudentProgressCard({ isEmbedded = false }) {
    const { userSession } = useERP();
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userSession?.db_id) return;
        fetchMarks();
    }, [userSession]);

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('marks_ledger')
                .select('*, master_subjects(name, code), profiles:faculty_id(full_name)')
                .eq('student_id', userSession.db_id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setMarks(data || []);
        } catch (error) {
            console.error('Error fetching progress card:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const calculateTotals = () => {
        let obtained = 0;
        let total = 0;
        marks.forEach(m => {
            obtained += Number(m.marks_obtained);
            total += Number(m.total_marks);
        });
        const percentage = total > 0 ? (obtained / total) * 100 : 0;
        return { obtained, total, percentage };
    };

    const totals = calculateTotals();

    return (
        <div className={`w-full animate-fade-in ${!isEmbedded ? "min-h-screen bg-themeApp p-4 sm:p-6 lg:p-8" : ""}`}>
            <div className="bg-white dark:bg-[#121212] rounded-[2rem] border border-gray-200 dark:border-white/5Border overflow-hidden shadow-sm">
                
                {/* Header Section */}
                <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-white/5Border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Internal Progress Card</h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-white/50 mt-1">Official verified assessment marks</p>
                    </div>

                    <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">Overall Average</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totals.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-white/10 mx-2"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">Total Score</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totals.obtained.toFixed(1)}<span className="text-sm text-gray-400">/{totals.total.toFixed(1)}</span></span>
                        </div>
                    </div>
                </div>

                {/* Marks Table */}
                <div className="p-4 lg:p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <i className="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
                            <p className="font-medium text-sm">Compiling transcripts...</p>
                        </div>
                    ) : marks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border rounded-full flex items-center justify-center text-3xl text-gray-300 dark:text-white/20 mb-4">
                                <i className="fa-solid fa-folder-open"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No grades published yet</h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-white/50 mt-1 max-w-sm">Your faculty has not locked and published any internal assessments for you yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marks.map(mark => (
                                <div key={mark.id} className="p-5 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5Border hover:border-gray-300 dark:hover:border-white/10 transition-all flex flex-col group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-4">
                                            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black tracking-widest uppercase rounded-lg border border-indigo-500/20 inline-block mb-3">
                                                {mark.assessment_type}
                                            </span>
                                            <h4 className="text-[15px] font-bold text-gray-900 dark:text-white leading-snug">{mark.master_subjects?.name || 'Unknown Subject'}</h4>
                                            <p className="text-[11px] font-bold text-gray-400 mt-1">{mark.master_subjects?.code}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{mark.marks_obtained}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">out of {mark.total_marks}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5Border flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[10px] text-gray-500 dark:text-white/50 font-bold">
                                                {mark.profiles?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-white/60 truncate max-w-[120px]">
                                                {mark.profiles?.full_name || 'System Admin'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400" title={new Date(mark.created_at).toLocaleString()}>
                                            {new Date(mark.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
