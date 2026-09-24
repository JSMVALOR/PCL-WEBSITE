import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

export default function FeaturedSubjects({ programId, limit = 8 }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubjects() {
            if (!programId) return;
            try {
                const { data, error } = await supabase
                    .from('master_subjects')
                    .select('name, code, credits, theme_color, target_semester')
                    .eq('program_id', programId)
                    .order('target_semester', { ascending: true })
                    .limit(limit * 3); 

                if (error) throw error;
                
                if (data) {
                    // Filter to get core subjects across early semesters
                    let picked = data.filter(s => s.code.includes('LAW') || s.target_semester <= 4);
                    
                    // Shuffle slightly to show variety, but keep early semesters first
                    picked = picked.sort((a,b) => a.target_semester - b.target_semester).slice(0, limit);
                    
                    // fallback
                    if (picked.length < limit) {
                        data.forEach(s => {
                            if (picked.length < limit && !picked.find(p => p.code === s.code)) picked.push(s);
                        });
                    }
                    setSubjects(picked);
                }
            } catch (err) {
                console.error("Error fetching featured subjects:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSubjects();
    }, [programId, limit]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 animate-pulse">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="h-24 bg-[var(--surface-color)] rounded-xl opacity-50 border border-[var(--border-color)]"></div>
                ))}
            </div>
        );
    }

    if (!subjects.length) return null;

    return (
        <div className="mt-8 relative z-10">
            <h3 className="text-2xl font-bold mb-6 text-[var(--text-color)] font-serif">Featured Subjects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((sub, idx) => {
                    const isLaw = sub.theme_color === 'indigo' || sub.code.includes('LAW');
                    return (
                        <div key={idx} className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--primary-color)] transition-colors duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-md ${isLaw ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]'}`}>
                                        Semester {sub.target_semester}
                                    </span>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
                                        {sub.credits} Credits
                                    </span>
                                </div>
                                <h4 className="font-bold text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors leading-snug mb-1.5 text-sm md:text-base pr-4">
                                    {sub.name}
                                </h4>
                                <p className="text-xs font-semibold text-[var(--text-muted)]">
                                    {sub.code}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-[var(--text-muted)] italic mt-6 text-center border-t border-[var(--border-color)] pt-6">
                * Note: This is an abbreviated list of featured subjects. The full master curriculum covers a comprehensive range of legal and interdisciplinary coursework.
            </p>
        </div>
    );
}
