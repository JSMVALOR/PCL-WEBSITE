/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

const GRADE_MAP = {
    'O':  10.0,
    'A':  9.0,
    'B':  8.0,
    'C':  7.0,
    'D':  6.0,
    'E':  5.0,
    'F':  0.0,
    'AB': 0.0
};

const GRADE_OPTIONS = ['O', 'A', 'B', 'C', 'D', 'E', 'F', 'AB'];

const gradeColor = (grade) => {
    if (!grade) return 'text-themeTextSec';
    if (['O', 'A+', 'A'].includes(grade)) return 'text-emerald-500';
    if (['B+', 'B'].includes(grade)) return 'text-amber-500';
    if (['C', 'P'].includes(grade)) return 'text-orange-500';
    return 'text-rose-500';
};

const resultColor = (result) => {
    if (result === 'pass') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (result === 'fail') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (result === 'withheld') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20';
};

export default function MenteeAcademicRecord({ menteeId, mentorId }) {
    const [results, setResults] = useState([]);
    const [internalMarks, setInternalMarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedSemester, setExpandedSemester] = useState(null);

    // Entry form state
    const [entrySemester, setEntrySemester] = useState(1);
    const [entryYear, setEntryYear] = useState("2025-26");
    const [entryRows, setEntryRows] = useState([
        { subject_name: '', subject_code: '', marks_obtained: '', max_marks: 100, grade: '', credits: '', result: 'pass' }
    ]);

    useEffect(() => {
        if (menteeId) fetchAll();
    }, [menteeId]);

    const [studentProfile, setStudentProfile] = useState(null);

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            // Fetch student profile for program
            const { data: prof } = await supabase.from('profiles').select('programme, academic_batch').eq('id', menteeId).single();
            if (prof) setStudentProfile(prof);

            // Fetch university exam results
            const { data: examData, error: examErr } = await supabase
                .from('exam_results')
                .select('*')
                .eq('student_id', menteeId)
                .order('semester', { ascending: true })
                .order('subject_name', { ascending: true });

            if (examErr) throw examErr;
            setResults(examData || []);

            // Fetch internal marks
            const { data: marksData, error: marksErr } = await supabase
                .from('marks_ledger')
                .select('*, master_subjects:subject_id(name, code)')
                .eq('student_id', menteeId)
                .order('created_at', { ascending: false });

            if (!marksErr) setInternalMarks(marksData || []);
        } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch subjects when semester changes in the form
    useEffect(() => {
        if (showEntryForm && entrySemester && studentProfile) {
            const fetchSubjects = async () => {
                // Find program ID
                const { data: progs } = await supabase.from('academic_programs').select('id, name');
                if (!progs) return;
                const match = progs.find(p => {
                    if (!studentProfile.programme) return false;
                    const p1 = studentProfile.programme.toLowerCase().replace(/\./g, '').trim();
                    const p2 = p.name.toLowerCase().replace(/\./g, '').trim();
                    return p1.includes(p2) || p2.includes(p1);
                });
                if (!match) return;

                const { data: subs } = await supabase.from('master_subjects')
                    .select('name, code, credits')
                    .eq('program_id', match.id)
                    .eq('target_semester', parseInt(entrySemester))
                    .eq('status', 'active');
                
                if (subs && subs.length > 0) {
                    setEntryRows(subs.map(s => ({
                        subject_name: s.name,
                        subject_code: s.code || '',
                        marks_obtained: '',
                        max_marks: 100,
                        grade: '',
                        credits: s.credits || '',
                        result: 'pass'
                    })));
                } else {
                    setEntryRows([]);
                }
            };
            fetchSubjects();
        }
    }, [entrySemester, showEntryForm]);

    // Group results by semester
    const semesterGroups = useMemo(() => {
        const groups = {};
        results.forEach(r => {
            const key = r.semester;
            if (!groups[key]) groups[key] = { semester: key, academic_year: r.academic_year, subjects: [] };
            groups[key].subjects.push(r);
        });
        return Object.values(groups).sort((a, b) => a.semester - b.semester);
    }, [results]);

    // Compute SGPA per semester
    const computeSGPA = (subjects) => {
        let totalCredits = 0;
        let totalCreditPoints = 0;
        subjects.forEach(s => {
            const cr = Number(s.credits) || 0;
            const gp = s.grade_points != null ? Number(s.grade_points) : (GRADE_MAP[s.grade] ?? 0);
            totalCredits += cr;
            totalCreditPoints += cr * gp;
        });
        return totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : '—';
    };

    // Compute CGPA across all semesters
    const cgpa = useMemo(() => {
        let totalCredits = 0;
        let totalCreditPoints = 0;
        results.forEach(r => {
            const cr = Number(r.credits) || 0;
            const gp = r.grade_points != null ? Number(r.grade_points) : (GRADE_MAP[r.grade] ?? 0);
            totalCredits += cr;
            totalCreditPoints += cr * gp;
        });
        return totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : '—';
    }, [results]);

    // Entry form handlers
    const addRow = () => {
        setEntryRows(prev => [...prev, { subject_name: '', subject_code: '', marks_obtained: '', max_marks: 100, grade: '', credits: '', result: 'pass' }]);
    };

    const removeRow = (idx) => {
        setEntryRows(prev => prev.filter((_, i) => i !== idx));
    };

    const updateRow = (idx, field, value) => {
        setEntryRows(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            // Auto-compute grade_points from grade
            if (field === 'grade') {
                next[idx].grade_points = GRADE_MAP[value] ?? '';
            }
            return next;
        });
    };

    const handleSaveResults = async () => {
        const validRows = entryRows.filter(r => r.subject_name.trim());
        if (validRows.length === 0) {
            window.erpDialog?.alert("Please enter at least one subject.");
            return;
        }

        setIsSaving(true);
        try {
            for (const row of validRows) {
                const payload = {
                    student_id: menteeId,
                    subject_name: row.subject_name.trim(),
                    subject_code: row.subject_code?.trim() || null,
                    semester: entrySemester,
                    academic_year: entryYear || null,
                    exam_type: 'End-Semester',
                    marks_obtained: row.marks_obtained ? Number(row.marks_obtained) : null,
                    max_marks: Number(row.max_marks) || 100,
                    grade: row.grade || null,
                    grade_points: row.grade_points != null && row.grade_points !== '' ? Number(row.grade_points) : (GRADE_MAP[row.grade] ?? null),
                    credits: row.credits ? Number(row.credits) : null,
                    credit_points: row.credits && row.grade ? (Number(row.credits) * (GRADE_MAP[row.grade] ?? 0)) : null,
                    result: row.result || 'pass',
                    entered_by: mentorId
                };

                // Upsert: check if result already exists for this student+subject+semester
                const { data: existing } = await supabase
                    .from('exam_results')
                    .select('id')
                    .eq('student_id', menteeId)
                    .eq('subject_name', row.subject_name.trim())
                    .eq('semester', entrySemester);

                if (existing && existing.length > 0) {
                    payload.updated_at = new Date().toISOString();
                    await supabase.from('exam_results').update(payload).eq('id', existing[0].id);
                } else {
                    await supabase.from('exam_results').insert(payload);
                }
            }

            window.erpDialog?.alert("Results saved successfully!");
            setShowEntryForm(false);
            setEntryRows([{ subject_name: '', subject_code: '', marks_obtained: '', max_marks: 100, grade: '', credits: '', result: 'pass' }]);
            fetchAll();
        } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-amber-500"></i>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-6">

            {/* ─── CGPA OVERVIEW ─── */}
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
                    <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 mb-1">Subjects</p>
                    <p className="text-3xl font-black text-themeText dark:text-white tracking-tight">{results.length || '—'}</p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 mb-1">Internals</p>
                    <p className="text-3xl font-black text-themeText dark:text-white tracking-tight">{internalMarks.length || '—'}</p>
                </div>
            </div>

            {/* ─── ADD RESULTS BUTTON ─── */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-graduation-cap text-indigo-500"></i> University Results
                </h3>
                <button
                    onClick={() => setShowEntryForm(!showEntryForm)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        showEntryForm
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
                >
                    <i className={`fa-solid ${showEntryForm ? 'fa-xmark' : 'fa-plus'}`}></i>
                    {showEntryForm ? 'Cancel' : 'Enter Results'}
                </button>
            </div>

            {/* ─── ENTRY FORM ─── */}
            {showEntryForm && (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 flex flex-col gap-5 animate-fade-in">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Semester</label>
                            <select value={entrySemester} onChange={e => setEntrySemester(Number(e.target.value))}
                                className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-bold text-themeText dark:text-white outline-none">
                                {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Academic Year</label>
                            <input type="text" value={entryYear} onChange={e => setEntryYear(e.target.value)} placeholder="2025-26"
                                className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-bold text-themeText dark:text-white outline-none w-28" />
                        </div>
                    </div>

                    {/* Subject Rows */}
                    <div className="flex flex-col gap-3">
                        {entryRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-xl border border-black/5 dark:border-white/5">
                                <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Subject Name *</label>
                                    <input type="text" value={row.subject_name} readOnly disabled placeholder="Law of Torts"
                                        className="px-2.5 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-themeTextSec dark:text-white/60 outline-none cursor-not-allowed" />
                                </div>
                                <div className="col-span-4 sm:col-span-1 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Code</label>
                                    <input type="text" value={row.subject_code} readOnly disabled placeholder="LAW101"
                                        className="px-2.5 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold text-themeTextSec dark:text-white/60 outline-none cursor-not-allowed" />
                                </div>
                                <div className="col-span-4 sm:col-span-1 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Marks</label>
                                    <input type="number" value={row.marks_obtained} onChange={e => updateRow(idx, 'marks_obtained', e.target.value)} placeholder="72"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />
                                </div>
                                <div className="col-span-4 sm:col-span-1 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Max</label>
                                    <input type="number" value={row.max_marks} onChange={e => updateRow(idx, 'max_marks', e.target.value)} placeholder="100"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />
                                </div>
                                <div className="col-span-4 sm:col-span-1 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Grade</label>
                                    <select value={row.grade} onChange={e => updateRow(idx, 'grade', e.target.value)}
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none">
                                        <option value="">—</option>
                                        {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-3 sm:col-span-1 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">GP</label>
                                    <input type="number" step="0.1" value={row.grade_points ?? ''} onChange={e => updateRow(idx, 'grade_points', e.target.value)} placeholder="8.0"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />
                                </div>
                                <div className="col-span-3 sm:col-span-1 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Credits</label>
                                    <input type="number" step="0.5" value={row.credits} onChange={e => updateRow(idx, 'credits', e.target.value)} placeholder="4"
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none" />
                                </div>
                                <div className="col-span-4 sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-themeTextSec">Result</label>
                                    <select value={row.result} onChange={e => updateRow(idx, 'result', e.target.value)}
                                        className="px-2.5 py-2 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold text-themeText dark:text-white outline-none">
                                        <option value="pass">Pass</option>
                                        <option value="fail">Fail</option>
                                        <option value="withheld">Withheld</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                                <div className="col-span-2 sm:col-span-1 flex items-end justify-center">
                                    {entryRows.length > 1 && (
                                        <button onClick={() => removeRow(idx)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center transition-colors">
                                            <i className="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        
                        <div className="ml-auto"></div>
                        <button onClick={handleSaveResults} disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed">
                            {isSaving ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fa-solid fa-check"></i> Save Results</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ─── SEMESTER RESULTS ACCORDION ─── */}
            {semesterGroups.length === 0 && !showEntryForm ? (
                <div className="w-full py-16 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                    <i className="fa-solid fa-file-circle-question text-3xl text-neutral-300 dark:text-white/20 mb-3"></i>
                    <h3 className="text-base font-black text-themeText dark:text-white mb-1">No University Results</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec dark:text-white/50">Click "Enter Results" to add semester marks and grades.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {semesterGroups.map(group => {
                        const isOpen = expandedSemester === group.semester;
                        const sgpa = computeSGPA(group.subjects);
                        const failCount = group.subjects.filter(s => s.result === 'fail').length;

                        return (
                            <div key={group.semester} className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
                                {/* Semester Header */}
                                <button onClick={() => setExpandedSemester(isOpen ? null : group.semester)}
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
                                        {failCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[9px] font-black">{failCount} KT</span>
                                        )}
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${Number(sgpa) >= 7 ? 'bg-emerald-500/10 text-emerald-500' : Number(sgpa) >= 5 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            SGPA {sgpa}
                                        </span>
                                        <i className={`fa-solid fa-chevron-down text-[10px] text-themeTextSec transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                                    </div>
                                </button>

                                {/* Expanded Subject Table */}
                                {isOpen && (
                                    <div className="border-t border-black/5 dark:border-white/5 animate-fade-in">
                                        {/* Desktop Table */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-[8px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 border-b border-black/5 dark:border-white/5">
                                                        <th className="px-4 py-3">Subject</th>
                                                        <th className="px-4 py-3 text-center">Marks</th>
                                                        <th className="px-4 py-3 text-center">Grade</th>
                                                        <th className="px-4 py-3 text-center">GP</th>
                                                        <th className="px-4 py-3 text-center">Credits</th>
                                                        <th className="px-4 py-3 text-center">CP</th>
                                                        <th className="px-4 py-3 text-center">Result</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.subjects.map(sub => (
                                                        <tr key={sub.id} className="border-b border-black/[0.03] dark:border-white/[0.03] hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm font-bold text-themeText dark:text-white">{sub.subject_name}</p>
                                                                {sub.subject_code && <p className="text-[9px] font-bold text-themeTextSec dark:text-white/40 mt-0.5">{sub.subject_code}</p>}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{sub.marks_obtained ?? '—'}/{sub.max_marks ?? 100}</td>
                                                            <td className={`px-4 py-3 text-center text-sm font-black ${gradeColor(sub.grade)}`}>{sub.grade || '—'}</td>
                                                            <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{sub.grade_points ?? '—'}</td>
                                                            <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{sub.credits ?? '—'}</td>
                                                            <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">
                                                                {sub.credits && sub.grade_points ? (Number(sub.credits) * Number(sub.grade_points)).toFixed(1) : '—'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${resultColor(sub.result)}`}>
                                                                    {sub.result || 'pass'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="sm:hidden flex flex-col gap-2 p-3">
                                            {group.subjects.map(sub => (
                                                <div key={sub.id} className="bg-black/[0.02] dark:bg-white/[0.02] rounded-xl p-3 border border-black/5 dark:border-white/5">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-bold text-themeText dark:text-white truncate flex-1">{sub.subject_name}</p>
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ml-2 ${resultColor(sub.result)}`}>
                                                            {sub.result || 'pass'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2 text-center">
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-themeTextSec">Marks</p>
                                                            <p className="text-xs font-bold text-themeText dark:text-white">{sub.marks_obtained ?? '—'}/{sub.max_marks ?? 100}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-themeTextSec">Grade</p>
                                                            <p className={`text-xs font-black ${gradeColor(sub.grade)}`}>{sub.grade || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-themeTextSec">GP</p>
                                                            <p className="text-xs font-bold text-themeText dark:text-white">{sub.grade_points ?? '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-themeTextSec">Credits</p>
                                                            <p className="text-xs font-bold text-themeText dark:text-white">{sub.credits ?? '—'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── INTERNAL MARKS SECTION ─── */}
            {internalMarks.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                    <h3 className="text-base font-black tracking-tight text-themeText dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-file-pen text-amber-500"></i> Internal Assessments
                    </h3>
                    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[8px] font-black uppercase tracking-widest text-themeTextSec dark:text-white/40 border-b border-black/5 dark:border-white/5">
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">Assessment</th>
                                        <th className="px-4 py-3 text-center">Marks</th>
                                        <th className="px-4 py-3 text-center">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {internalMarks.map(m => (
                                        <tr key={m.id} className="border-b border-black/[0.03] dark:border-white/[0.03]">
                                            <td className="px-4 py-3 text-sm font-bold text-themeText dark:text-white">{m.master_subjects?.name || '—'}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-themeTextSec">{m.assessment_type}</td>
                                            <td className="px-4 py-3 text-center text-sm font-bold text-themeText dark:text-white">{m.marks_obtained}/{m.total_marks}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-sm font-black ${(m.marks_obtained / m.total_marks * 100) >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {((m.marks_obtained / m.total_marks) * 100).toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
