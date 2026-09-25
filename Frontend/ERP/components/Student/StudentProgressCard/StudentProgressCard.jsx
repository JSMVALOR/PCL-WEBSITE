/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';

const GRADE_MAP = {
    'O':  10.0, 'A+': 9.0, 'A':  8.0, 'B+': 7.0, 'B':  6.0,
    'C':  5.0, 'P':  4.0, 'F':  0.0, 'AB': 0.0
};

const gradeColor = (grade) => {
    if (!grade) return 'text-themeTextSec';
    if (['O', 'A+', 'A'].includes(grade)) return 'text-emerald-500';
    if (['B+', 'B'].includes(grade)) return 'text-amber-500';
    if (['C', 'P'].includes(grade)) return 'text-orange-500';
    return 'text-rose-500';
};

const resultBadge = (result) => {
    if (result === 'pass') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (result === 'fail') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
};

export default function StudentProgressCard({ isEmbedded = false }) {
    const { userSession } = useERP();
    const [marks, setMarks] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('university'); // 'university' or 'internal'

    useEffect(() => {
        if (!userSession?.db_id) return;
        fetchAll();
    }, [userSession]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Internal marks
            const { data: marksData, error: mErr } = await supabase
                .from('marks_ledger')
                .select('*, master_subjects:subject_id(name, code), profiles:faculty_id(full_name)')
                .eq('student_id', userSession.db_id)
                .order('created_at', { ascending: false });
            
            if (!mErr) setMarks(marksData || []);

            // University exam results
            const { data: examData, error: eErr } = await supabase
                .from('exam_results')
                .select('*')
                .eq('student_id', userSession.db_id)
                .order('semester', { ascending: true })
                .order('subject_name', { ascending: true });

            if (!eErr) setExamResults(examData || []);
        } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setLoading(false);
        }
    };

    // Group exam results by semester
    const semesterGroups = useMemo(() => {
        const groups = {};
        examResults.forEach(r => {
            if (!groups[r.semester]) groups[r.semester] = { semester: r.semester, academic_year: r.academic_year, subjects: [] };
            groups[r.semester].subjects.push(r);
        });
        return Object.values(groups).sort((a, b) => a.semester - b.semester);
    }, [examResults]);

    // CGPA
    const cgpa = useMemo(() => {
        let totalCredits = 0, totalCP = 0;
        examResults.forEach(r => {
            const cr = Number(r.credits) || 0;
            const gp = r.grade_points != null ? Number(r.grade_points) : (GRADE_MAP[r.grade] ?? 0);
            totalCredits += cr;
            totalCP += cr * gp;
        });
        return totalCredits > 0 ? (totalCP / totalCredits).toFixed(2) : '—';
    }, [examResults]);

    // SGPA for a semester
    const computeSGPA = (subjects) => {
        let tc = 0, tcp = 0;
        subjects.forEach(s => {
            const cr = Number(s.credits) || 0;
            const gp = s.grade_points != null ? Number(s.grade_points) : (GRADE_MAP[s.grade] ?? 0);
            tc += cr; tcp += cr * gp;
        });
        return tc > 0 ? (tcp / tc).toFixed(2) : '—';
    };

    // Internal totals
    const internalTotals = useMemo(() => {
        let obtained = 0, total = 0;
        marks.forEach(m => { obtained += Number(m.marks_obtained); total += Number(m.total_marks); });
        return { obtained, total, percentage: total > 0 ? (obtained / total) * 100 : 0 };
    }, [marks]);

    const [expandedSem, setExpandedSem] = useState(null);

    return (
        <div className={`w-full animate-fade-in ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText dark:text-themeText p-4 sm:p-6 lg:p-8 pb-32 lg:pb-32 xl:pb-8" : ""}`}>
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8">

                {/* Header */}
                {!isEmbedded && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-themePanel/40 backdrop-blur-3xl rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm p-6 lg:p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl shadow-inner">
                                <i className="fa-solid fa-file-signature"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-themeText dark:text-white">Academic Progress</h1>
                                <p className="text-sm font-medium text-themeTextSec mt-1">University results, internal marks, and CGPA tracker.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overview Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 mb-1">CGPA</p>
                        <p className="text-3xl font-black text-themeText dark:text-white tracking-tight">{cgpa}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 mb-1">Semesters</p>
                        <p className="text-3xl font-black text-themeText dark:text-white tracking-tight">{semesterGroups.length || '—'}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 mb-1">Internal Avg</p>
                        <p className="text-3xl font-black text-themeText dark:text-white tracking-tight">{internalTotals.percentage > 0 ? internalTotals.percentage.toFixed(1) + '%' : '—'}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 mb-1">Subjects</p>
                        <p className="text-3xl font-black text-themeText dark:text-white tracking-tight">{examResults.length + marks.length || '—'}</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-black/[0.03] dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 w-fit gap-1">
                    {[
                        { id: 'university', label: 'University Results', icon: 'fa-graduation-cap' },
                        { id: 'internal', label: 'Internal Marks', icon: 'fa-file-pen' },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveView(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-2 ${
                                activeView === tab.id
                                    ? 'bg-white dark:bg-white/15 text-themeText dark:text-white border border-black/5 dark:border-white/20 shadow-sm'
                                    : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:hover:text-white/80'
                            }`}>
                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500 mb-4"></i>
                        <p className="text-sm font-bold text-themeTextSec uppercase tracking-widest">Loading academic records...</p>
                    </div>
                ) : activeView === 'university' ? (
                    /* ═══ UNIVERSITY RESULTS ═══ */
                    semesterGroups.length === 0 ? (
                        <div className="w-full py-16 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                            <i className="fa-solid fa-file-circle-question text-3xl text-neutral-300 dark:text-white/20 mb-3"></i>
                            <h3 className="text-base font-black text-themeText dark:text-white mb-1">No University Results Yet</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">Your mentor has not entered any exam results yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {semesterGroups.map(group => {
                                const isOpen = expandedSem === group.semester;
                                const sgpa = computeSGPA(group.subjects);
                                const failCount = group.subjects.filter(s => s.result === 'fail').length;

                                return (
                                    <div key={group.semester} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
                                        <button onClick={() => setExpandedSem(isOpen ? null : group.semester)}
                                            className="w-full p-4 flex items-center gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm shrink-0">
                                                S{group.semester}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-themeText dark:text-white">Semester {group.semester}</h4>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">
                                                    {group.academic_year || '—'} • {group.subjects.length} Subjects
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {failCount > 0 && <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[9px] font-black">{failCount} KT</span>}
                                                <span className={`px-3 py-1 rounded-lg text-xs font-black ${Number(sgpa) >= 7 ? 'bg-emerald-500/10 text-emerald-500' : Number(sgpa) >= 5 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    SGPA {sgpa}
                                                </span>
                                                <i className={`fa-solid fa-chevron-down text-[10px] text-themeTextSec transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="border-t border-black/5 dark:border-white/5 animate-fade-in">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="text-[8px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 border-b border-black/5 dark:border-white/5">
                                                                <th className="px-4 py-3">Subject</th>
                                                                <th className="px-4 py-3 text-center">Marks</th>
                                                                <th className="px-4 py-3 text-center">Grade</th>
                                                                <th className="px-4 py-3 text-center">GP</th>
                                                                <th className="px-4 py-3 text-center">Credits</th>
                                                                <th className="px-4 py-3 text-center">Result</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.subjects.map(sub => (
                                                                <tr key={sub.id} className="border-b border-black/[0.03] dark:border-white/[0.03]">
                                                                    <td className="px-4 py-3">
                                                                        <p className="text-sm font-bold text-themeText dark:text-white">{sub.subject_name}</p>
                                                                        {sub.subject_code && <p className="text-[9px] font-bold text-themeTextSec mt-0.5">{sub.subject_code}</p>}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{sub.marks_obtained ?? '—'}/{sub.max_marks ?? 100}</td>
                                                                    <td className={`px-4 py-3 text-center text-sm font-black ${gradeColor(sub.grade)}`}>{sub.grade || '—'}</td>
                                                                    <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{sub.grade_points ?? '—'}</td>
                                                                    <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{sub.credits ?? '—'}</td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${resultBadge(sub.result)}`}>
                                                                            {sub.result || 'pass'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* ═══ INTERNAL MARKS ═══ */
                    marks.length === 0 ? (
                        <div className="w-full py-16 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                            <i className="fa-solid fa-folder-open text-3xl text-neutral-300 dark:text-white/20 mb-3"></i>
                            <h3 className="text-base font-black text-themeText dark:text-white mb-1">No Internal Marks Yet</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">Faculty has not published any internal assessments yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marks.map(mark => (
                                <div key={mark.id} className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all flex flex-col group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-4">
                                            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black tracking-widest uppercase rounded-lg border border-indigo-500/20 inline-block mb-3">
                                                {mark.assessment_type}
                                            </span>
                                            <h4 className="text-[15px] font-bold text-themeText dark:text-white leading-snug">{mark.master_subjects?.name || 'Unknown Subject'}</h4>
                                            <p className="text-[11px] font-bold text-themeTextSec mt-1">{mark.master_subjects?.code}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-black text-themeText dark:text-white tracking-tight">{mark.marks_obtained}</p>
                                            <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">out of {mark.total_marks}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] text-themeTextSec dark:text-white/50 font-bold">
                                                {mark.profiles?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-xs font-semibold text-themeTextSec dark:text-white/60 truncate max-w-[120px]">
                                                {mark.profiles?.full_name || 'System'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-themeTextSec" title={new Date(mark.created_at).toLocaleString()}>
                                            {new Date(mark.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
