/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

const AVAILABLE_COLORS = [
    { name: 'Blue', value: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', solid: 'bg-blue-500' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', solid: 'bg-emerald-500' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', solid: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', solid: 'bg-orange-500' },
    { name: 'Rose', value: 'rose', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', solid: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', solid: 'bg-amber-500' },
    { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-500', solid: 'bg-cyan-500' },
];

export default function CohortManager() {
    const [programs, setPrograms] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreatingProg, setIsCreatingProg] = useState(false);
    const [isCreatingBatch, setIsCreatingBatch] = useState(false);

    // Form states
    const [progName, setProgName] = useState('');
    const [progCode, setProgCode] = useState('');
    const [progDuration, setProgDuration] = useState(5);
    const [editingProgId, setEditingProgId] = useState(null);
    const [progTheme, setProgTheme] = useState('blue');

    const [batchProgId, setBatchProgId] = useState('');
    const [batchStart, setBatchStart] = useState(new Date().getFullYear());
    const [editingBatchId, setEditingBatchId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: pData, error: pErr } = await supabase.from('academic_programs').select('*').order('created_at', { ascending: false });
            if (pErr && pErr.code !== '42P01') throw pErr;
            setPrograms(pData || []);

            const { data: bData, error: bErr } = await supabase.from('academic_batches').select('*, academic_programs(name, code, duration_years, theme_color)').order('start_year', { ascending: false });
            if (bErr && bErr.code !== '42P01') throw bErr;
            setBatches(bData || []);
        } catch (err) {
            console.error("Cohort Data Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateProgram = async (e) => {
        e.preventDefault();
        const payload = { 
            name: progName, 
            code: progCode.toUpperCase(),
            duration_years: Number(progDuration),
            theme_color: progTheme 
        };
        
        let error;
        if (editingProgId) {
            const res = await supabase.from('academic_programs').update(payload).eq('id', editingProgId);
            error = res.error;
        } else {
            const res = await supabase.from('academic_programs').insert([payload]);
            error = res.error;
        }

        if (error) {
            console.error(error);
            window.erpDialog?.alert(error.message);
            return;
        }
        setIsCreatingProg(false); setEditingProgId(null); setProgName(''); setProgCode(''); setProgDuration(5); fetchData();
    };

    const handleEditProgram = (p) => {
        setEditingProgId(p.id);
        setProgName(p.name);
        setProgCode(p.code);
        setProgDuration(p.duration_years);
        setProgTheme(p.theme_color || 'blue');
        setIsCreatingProg(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        const prog = programs.find(p => p.id === batchProgId);
        if (!prog) return;

        const endYear = Number(batchStart) + Number(prog.duration_years);
        const autoName = `${prog.code} (Class of ${endYear})`;

        const payload = { 
            name: autoName, 
            program_id: batchProgId, 
            start_year: Number(batchStart), 
            end_year: endYear };

        let error;
        if (editingBatchId) {
            const res = await supabase.from('academic_batches').update(payload).eq('id', editingBatchId);
            error = res.error;
        } else {
            // Only set current_semester to 1 on initial creation
            payload.current_semester = 1;
            const res = await supabase.from('academic_batches').insert([payload]);
            error = res.error;
        }
        
        if (error) {
            console.error("Save Error:", error);
            window.erpDialog?.alert(`Failed to save cohort: ${error.message || 'Check database schema'}`);
            return;
        }
        
        setIsCreatingBatch(false); setEditingBatchId(null); setBatchProgId(''); fetchData();
        window.erpDialog?.alert(`✅ Successfully ${editingBatchId ? 'updated' : 'generated'} ${autoName}`);
    };

    const handleEditBatch = (b) => {
        setEditingBatchId(b.id);
        setBatchProgId(b.program_id);
        setBatchStart(b.start_year);
        setIsCreatingBatch(true);
    };

    const handleDeleteBatch = async (id) => {
        if (!await window.erpDialog?.confirm("Are you sure? This deletes the cohort and ALL associated subjects.", "Delete Cohort")) return;
        await supabase.from('academic_batches').delete().eq('id', id);
        fetchData();
    };

    const handlePromoteBatch = async (batch) => {
        if (!await window.erpDialog?.confirm(`Are you sure you want to promote ${batch.name} to Semester ${batch.current_semester + 1}? This will trigger curriculum deployment.`, "Promote Cohort")) return;
        const { error } = await supabase.from('academic_batches').update({ current_semester: batch.current_semester + 1 }).eq('id', batch.id);
        if (error) {
            window.erpDialog?.alert("Failed to promote cohort.");
            return;
        }
        window.erpDialog?.alert(`✅ ${batch.name} officially promoted to Semester ${batch.current_semester + 1}. You can now assign faculty in the Allocator.`);
        fetchData();
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-12">
            
            {/* PROGRAMS SECTION */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Degree Programs</h2>
                        <p className="text-xs font-bold text-gray-500 dark:text-white/50 tracking-wide mt-1">Foundational degree structures.</p>
                    </div>
                    <button type="button" onClick={() => { setIsCreatingProg(!isCreatingProg); setEditingProgId(null); setProgName(''); setProgCode(''); }} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs tracking-wide rounded-xl transition shadow-sm hover:opacity-90">
                        {isCreatingProg ? 'Cancel' : 'New Program'}
                    </button>
                </div>

                {isCreatingProg && (
                    <form onSubmit={handleCreateProgram} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1.5">Program Code</label>
                                <input required type="text" placeholder="e.g. BALLB" value={progCode} onChange={e => setProgCode(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1.5">Full Name</label>
                                <input required type="text" placeholder="e.g. BA.LLB (Hons.)" value={progName} onChange={e => setProgName(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-500" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1.5">Duration (Yrs)</label>
                                <select required value={progDuration} onChange={e => setProgDuration(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-500 appearance-none">
                                    {[1,2,3,4,5,6].map(y => <option key={y} value={y}>{y} Years</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-2">Program Identity Color (Cohorts & Subjects will inherit this)</label>
                            <div className="flex flex-wrap gap-3">
                                {AVAILABLE_COLORS.map(c => (
                                    <button type="button" key={c.value} onClick={() => setProgTheme(c.value)} className={`w-10 h-10 rounded-full transition-transform ${progTheme === c.value ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-gray-400 dark:ring-white/30' : 'hover:scale-105 opacity-70'} ${c.solid}`}></button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition hover:opacity-90 mt-2">
                            {editingProgId ? 'Save Changes' : 'Deploy Degree Program'}
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {programs.map(p => {
                        const theme = AVAILABLE_COLORS.find(c => c.value === p.theme_color) || AVAILABLE_COLORS[0];
                        return (
                        <div key={p.id} className={`bg-white dark:bg-white/[0.02] border ${theme.border} p-5 rounded-2xl flex flex-col items-center justify-center text-center group transition relative overflow-hidden shadow-sm hover:shadow-md`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 -z-10 ${theme.solid}`}></div>
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                                <button onClick={() => handleEditProgram(p)} className="w-7 h-7 rounded bg-white/50 dark:bg-black/50 text-gray-700 dark:text-white/70 hover:bg-amber-500 hover:text-white flex items-center justify-center transition backdrop-blur-sm">
                                    <i className="fa-solid fa-pen text-[10px]"></i>
                                </button>
                                <button onClick={() => handleDeleteProgram(p.id)} className="w-7 h-7 rounded bg-white/50 dark:bg-black/50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition backdrop-blur-sm">
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                </button>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center font-black text-lg mb-3 ring-1 ring-black/5 dark:ring-white/10`}>
                                {p.duration_years}Y
                            </div>
                            <span className={`text-[14px] font-black tracking-tight ${theme.text} leading-none`}>{p.code}</span>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-wide mt-1.5">{p.name}</span>
                        </div>
                        );
                    })}
                </div>
            </div>


            <hr className="border-gray-200 dark:border-white/5 my-4" />


            {/* COHORTS SECTION */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">Cohort State</h2>
                        <p className="text-xs font-bold text-gray-500 dark:text-white/50 tracking-wide mt-1">Mathematically generate class identities.</p>
                    </div>
                    <button type="button" onClick={() => { setIsCreatingBatch(!isCreatingBatch); setEditingBatchId(null); setBatchProgId(''); }} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs tracking-wide rounded-xl transition shadow-lg shadow-blue-500/20">
                        <i className={`fa-solid ${isCreatingBatch ? 'fa-xmark' : 'fa-plus'} mr-2`}></i> {isCreatingBatch ? 'Cancel' : 'Auto-Generate'}
                    </button>
                </div>

                {isCreatingBatch && (
                    <form onSubmit={handleCreateBatch} className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex flex-col gap-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1.5">1. Select Program</label>
                                <select required value={batchProgId} onChange={e => setBatchProgId(e.target.value)} className="w-full bg-white dark:bg-black border border-blue-500/20 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 appearance-none shadow-sm">
                                    <option value="">Choose Degree...</option>
                                    {programs.map(p => <option key={p.id} value={p.id}>{p.code} ({p.duration_years}Y)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1.5">2. Admission Year</label>
                                <select required value={batchStart} onChange={e => setBatchStart(e.target.value)} className="w-full bg-white dark:bg-black border border-blue-500/20 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 appearance-none shadow-sm">
                                    {[...Array(6)].map((_, i) => {
                                        const year = new Date().getFullYear() - 2 + i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                        </div>


                        
                        <div className="mt-2">
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition shadow-lg shadow-blue-500/30">
                                {editingBatchId ? 'Save Changes' : 'Auto-Generate Cohort'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {batches.map(b => {
                        const theme = AVAILABLE_COLORS.find(c => c.value === b.academic_programs?.theme_color) || AVAILABLE_COLORS[0];
                        return (
                            <div key={b.id} className={`bg-white dark:bg-[#121212] border ${theme.border} rounded-2xl p-5 relative overflow-hidden group hover:border-black/10 dark:hover:border-white/20 transition shadow-sm`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -z-10 ${theme.solid}`}></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase ${theme.bg} ${theme.text}`}>
                                        Semester {b.current_semester}
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10 shrink-0">
                                        <button onClick={() => handlePromoteBatch(b)} className={`px-3 py-1.5 rounded-lg ${theme.bg} ${theme.text} font-bold text-[10px] uppercase tracking-wider hover:${theme.solid} hover:text-white transition`}>
                                            Promote
                                        </button>
                                        <button onClick={() => handleEditBatch(b)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 opacity-0 group-hover:opacity-100 transition hover:bg-amber-500 hover:text-white flex items-center justify-center shrink-0">
                                            <i className="fa-solid fa-pen text-xs"></i>
                                        </button>
                                        <button onClick={() => handleDeleteBatch(b.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition hover:bg-rose-500 hover:text-white flex items-center justify-center shrink-0">
                                            <i className="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white mb-3">{b.name}</h3>
                                
                                <div className="space-y-2">
                                    <div className="text-[11px] font-bold text-gray-500 dark:text-white/50 flex items-center gap-2">
                                        <i className="fa-solid fa-graduation-cap w-4"></i> {b.academic_programs?.name} ({b.academic_programs?.duration_years} Years)
                                    </div>
                                    <div className="text-[11px] font-bold text-gray-500 dark:text-white/50 flex items-center gap-2">
                                        <i className="fa-solid fa-calendar w-4"></i> Batch of {b.start_year} - {b.end_year}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
