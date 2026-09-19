/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';
import SyllabusEditorModal from './components/SyllabusEditorModal';

const AVAILABLE_COLORS = [
    { name: 'Blue', value: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', solid: 'bg-blue-500' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', solid: 'bg-emerald-500' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', solid: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', solid: 'bg-orange-500' },
    { name: 'Rose', value: 'rose', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', solid: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', solid: 'bg-amber-500' },
    { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-500', solid: 'bg-cyan-500' },
];

export default function SubjectBuilder({ _isEmbedded = false }) {
    const [subjects, setSubjects] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // Detailed Syllabus Viewer State
    const [activeSyllabusSubject, setActiveSyllabusSubject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [programFilter, setProgramFilter] = useState('All');

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [credits, setCredits] = useState(4);
    const [semester, setSemester] = useState(1);
    const [themeColor, setThemeColor] = useState('blue');
    const [programId, setProgramId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: pData } = await supabase.from('academic_programs').select('id, name, code, duration_years').eq('status', 'active');
            setPrograms(pData || []);
            
            const { data: subData, error: subError } = await supabase
                .from('master_subjects')
                .select(`id, code, name, credits, theme_color, target_semester, program_id, syllabus, academic_programs(id, name, code, theme_color)`)
                .order('target_semester', { ascending: true });

            if (subError && subError.code !== '42P01') {
                console.error("Master Subject error:", subError);
            } else {
                setSubjects(subData || []);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setCode('');
        setName('');
        setCredits(4);
        setSemester(1);
        setThemeColor('blue');
        setProgramId('');
    };

    const handleEdit = (sub) => {
        setIsCreating(true);
        setEditingId(sub.id);
        setCode(sub.code);
        setName(sub.name);
        setCredits(sub.credits);
        setSemester(sub.target_semester);
        setThemeColor(sub.theme_color);
        setProgramId(sub.program_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                code, name, credits, target_semester: semester,
                theme_color: themeColor, program_id: programId || null
            };

            let error;
            if (editingId) {
                const res = await supabase.from('master_subjects').update(payload).eq('id', editingId);
                error = res.error;
            } else {
                const res = await supabase.from('master_subjects').insert([payload]);
                error = res.error;
            }

            if (error) throw error;
            resetForm();
            fetchData();
            window.erpDialog?.alert(`✅ Master Syllabus ${editingId ? 'Updated' : 'Deployed'}`);
        } catch (err) {
            console.error(err);
            window.erpDialog?.alert("Error saving subject. Ensure the V6_CURRICULUM_VAULT SQL migration was run.");
        }
    };

    const handleDelete = async (id) => {
        if (!await window.erpDialog?.confirm("Delete this master subject? This removes it from the curriculum permanently.", "Delete Syllabus")) return;
        await supabase.from('master_subjects').delete().eq('id', id);
        fetchData();
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Curriculum Vault</h2>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/50 tracking-wide mt-1">Design the 5-year master syllabus. Assign faculty later.</p>
                </div>
                <button type="button" onClick={() => { if(isCreating) resetForm(); else setIsCreating(true); }} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs tracking-wide rounded-xl transition shadow-lg shadow-amber-500/20">
                    <i className={`fa-solid ${isCreating ? 'fa-xmark' : 'fa-plus'} mr-2`}></i> {isCreating ? 'Cancel' : 'New Template'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleSave} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-widest uppercase mb-1.5 block">Subject Code *</label>
                            <input required type="text" placeholder="e.g. LAW101" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-widest uppercase mb-1.5 block">Subject Name *</label>
                            <input required type="text" placeholder="e.g. Constitutional Law I" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-widest uppercase mb-1.5 block">Target Degree Program</label>
                            <select required value={programId} onChange={e => setProgramId(e.target.value)} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 appearance-none">
                                <option value="">Select Degree...</option>
                                {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-widest uppercase mb-1.5 block">Target Semester</label>
                                <input required type="number" min="1" max="10" value={semester} onChange={e => setSemester(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 tracking-widest uppercase mb-1.5 block">Credits</label>
                                <input required type="number" min="1" value={credits} onChange={e => setCredits(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                            </div>
                        </div>

                    </div>
                    <button type="submit" className="w-full mt-2 bg-gray-900 dark:bg-white text-white dark:text-black py-4 rounded-xl text-sm font-black tracking-wide hover:opacity-90 transition">
                        {editingId ? 'Save Edits' : 'Save to Master Vault'}
                    </button>
                </form>
            )}

            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30 text-sm"></i>
                    <input 
                        type="text" 
                        placeholder="Search subjects by code or name..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 transition"
                    />
                </div>
                <select 
                    value={programFilter} 
                    onChange={e => setProgramFilter(e.target.value)}
                    className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 appearance-none min-w-[200px]"
                >
                    <option value="All">All Programs</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
            </div>

            {loading ? (
                <div className="w-full text-center py-10 opacity-50"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
            ) : subjects.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#121212] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-center px-4">
                    <i className="fa-solid fa-vault text-4xl text-gray-400 dark:text-white/20 mb-4"></i>
                    <h3 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">Vault is Empty</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-white/50 mt-1 max-w-sm">Design your first master syllabus template for a degree program.</p>
                </div>
            ) : (() => {
                const filtered = subjects.filter(sub => {
                    if (programFilter !== 'All' && sub.program_id !== programFilter) return false;
                    if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        if (!sub.name.toLowerCase().includes(q) && !sub.code.toLowerCase().includes(q)) return false;
                    }
                    return true;
                });

                if (filtered.length === 0) {
                    return (
                        <div className="text-center py-10 text-gray-500 font-bold text-sm">
                            No subjects match your search.
                        </div>
                    );
                }

                // Group by Program -> Semester
                const grouped = {};
                filtered.forEach(sub => {
                    const prog = sub.academic_programs?.name || 'Unassigned Program';
                    const sem = sub.target_semester || 'Unassigned';
                    if (!grouped[prog]) grouped[prog] = {};
                    if (!grouped[prog][sem]) grouped[prog][sem] = [];
                    grouped[prog][sem].push(sub);
                });

                // Sort Programs and Semesters
                const sortedPrograms = Object.keys(grouped).sort();
                
                return sortedPrograms.map(prog => (
                    <div key={prog} className="mb-10">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3">
                            <i className="fa-solid fa-graduation-cap text-amber-500"></i> {prog}
                        </h2>
                        
                        {Object.keys(grouped[prog]).sort((a,b) => Number(a) - Number(b)).map(sem => {
                            const semSubjects = grouped[prog][sem];
                            const semCredits = semSubjects.reduce((sum, sub) => sum + sub.credits, 0);
                            return (
                            <div key={sem} className="mb-8 ml-4">
                                <div className="flex items-center justify-between mb-4 pr-2">
                                    <h3 className="text-sm font-black text-gray-500 dark:text-white/50 tracking-widest uppercase flex items-center gap-2">
                                        <span className="w-6 h-px bg-gray-300 dark:bg-white/20"></span> 
                                        Semester {sem}
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-bold text-gray-500 dark:text-white/40 tracking-wider uppercase">{semSubjects.length} Subjects</span>
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-md text-[10px] font-bold text-gray-500 dark:text-white/40 tracking-wider uppercase">{semCredits} Credits</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {grouped[prog][sem].map(sub => {
                                        const theme = AVAILABLE_COLORS.find(c => c.value === sub.theme_color) || AVAILABLE_COLORS.find(c => c.value === sub.academic_programs?.theme_color) || AVAILABLE_COLORS[0];
                                        return (
                                            <div key={sub.id} onClick={() => setActiveSyllabusSubject(sub)} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition cursor-pointer">
                                                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -z-10 ${theme.solid}`}></div>
                                                
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`px-2 py-1 rounded border text-[10px] font-black tracking-widest ${theme.bg} ${theme.border} ${theme.text}`}>
                                                        {sub.code}
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={e => e.stopPropagation()}>
                                                        <button onClick={() => handleEdit(sub)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/70 hover:bg-amber-500 hover:text-black flex items-center justify-center transition">
                                                            <i className="fa-solid fa-pen text-xs"></i>
                                                        </button>
                                                        <button onClick={() => handleDelete(sub.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition">
                                                            <i className="fa-solid fa-trash text-xs"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white leading-tight mb-2">{sub.name}</h3>
                                                
                                                <div className="space-y-1.5 mb-2">
                                                    <div className="text-[11px] font-bold text-gray-500 dark:text-white/50 flex items-center gap-2">
                                                        <i className="fa-solid fa-award w-4"></i> {sub.credits} Credits
                                                    </div>
                                                    {sub.syllabus && Object.keys(sub.syllabus).length > 0 && (
                                                        <div className="text-[11px] font-black text-amber-500 flex items-center gap-2 mt-2">
                                                            <i className="fa-solid fa-book-open w-4"></i> Detailed Syllabus Available
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )})}
                    </div>
                ));
            })()}
{activeSyllabusSubject && (
                <SyllabusEditorModal
                    subject={activeSyllabusSubject}
                    onClose={() => setActiveSyllabusSubject(null)}
                    onRefresh={fetchData}
                />
            )}
        </div>
    );
}
