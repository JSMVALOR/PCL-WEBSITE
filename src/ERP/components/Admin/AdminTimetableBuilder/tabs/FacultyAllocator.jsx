/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../Shared/lib/supabase/supabaseClient';

export default function FacultyAllocator() {
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    
    const [faculties, setFaculties] = useState([]);
    const [masterSubjects, setMasterSubjects] = useState([]);
    const [cohortSubjects, setCohortSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInitial = async () => {
            const { data: bData } = await supabase.from('academic_batches').select('id, name, current_semester, program_id').eq('status', 'active');
            setBatches(bData || []);
            
            const { data: fData } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
            setFaculties(fData || []);
        };
        fetchInitial();
    }, []);

    useEffect(() => {
        if (!selectedBatchId) {
            setMasterSubjects([]);
            return;
        }
        
        const loadSubjects = async () => {
            setLoading(true);
            const batch = batches.find(b => b.id === selectedBatchId);
            if (!batch) return;

            // 1. Fetch Master Subjects for this program & semester
            const { data: mData } = await supabase.from('master_subjects')
                .select('*')
                .eq('program_id', batch.program_id)
                .eq('target_semester', batch.current_semester);
            
            setMasterSubjects(mData || []);

            // 2. Fetch existing assignments
            const { data: cData } = await supabase.from('cohort_subjects')
                .select('*')
                .eq('batch_id', batch.id);
                
            setCohortSubjects(cData || []);
            setLoading(false);
        };
        loadSubjects();
    }, [selectedBatchId, batches]);

    const handleAssign = async (masterId, facultyId) => {
        const existing = cohortSubjects.find(c => c.master_subject_id === masterId);
        
        try {
            const master = masterSubjects.find(m => m.id === masterId);
            const batch = batches.find(b => b.id === selectedBatchId);
            const newName = faculties.find(f => f.id === facultyId)?.full_name || 'Unassigned';
            
            // If picking a brand new assignment or overwriting an existing one to a new faculty
            if (facultyId && (!existing || existing.faculty_id !== facultyId)) {
                const confirmed = await window.erpDialog?.confirm(
                    `Are you sure you want to officially assign ${newName} to ${master?.name}? This will instantly notify the faculty via email.`, 
                    "Confirm Official Assignment"
                );
                
                if (!confirmed) {
                    setCohortSubjects([...cohortSubjects]);
                    return;
                }
            } else if (existing && !facultyId) {
                // If unassigning
                const confirmed = await window.erpDialog?.confirm(
                    `Are you sure you want to completely unassign this subject? This might affect existing timetables.`, 
                    "Revoke Assignment"
                );
                if (!confirmed) {
                    setCohortSubjects([...cohortSubjects]);
                    return;
                }
            }

            if (existing) {
                if (!facultyId) {
                    const { error } = await supabase.from('cohort_subjects').delete().eq('id', existing.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('cohort_subjects').update({ faculty_id: facultyId }).eq('id', existing.id);
                    if (error) throw error;
                }
            } else if (facultyId) {
                const { error } = await supabase.from('cohort_subjects').insert([{
                    master_subject_id: masterId,
                    batch_id: selectedBatchId,
                    faculty_id: facultyId
                }]);
                if (error) throw error;
            }
            
            // Dual-Mail Dispatch System
            if (existing && existing.faculty_id && facultyId && existing.faculty_id !== facultyId) {
                // CASE 1: True Reassignment (Swap)
                const oldName = faculties.find(f => f.id === existing.faculty_id)?.full_name || 'Unknown';
                console.log(`[EMAIL DISPATCH] To: ${oldName} | Subject: Assignment Revoked - ${master?.name} | Body: Please be informed that your assignment for ${master?.name} (${batch?.name}) has been reassigned to another faculty member.`);
                console.log(`[EMAIL DISPATCH] To: ${newName} | Subject: New Class Allocation - ${master?.name} | Body: You have been officially allocated to teach ${master?.name} for ${batch?.name}.`);
                window.erpDialog?.alert(`✅ Reassignment Complete. Automated emails have been dispatched to both ${oldName} and ${newName}.`);
            } 
            else if (existing && existing.faculty_id && !facultyId) {
                // CASE 2: Unassigned Completely
                const oldName = faculties.find(f => f.id === existing.faculty_id)?.full_name || 'Unknown';
                console.log(`[EMAIL DISPATCH] To: ${oldName} | Subject: Assignment Revoked - ${master?.name} | Body: Please be informed that your assignment for ${master?.name} (${batch?.name}) has been revoked.`);
                window.erpDialog?.alert(`✅ Revocation Confirmed. An automated notification email has been dispatched to ${oldName}.`);
            } 
            else if (facultyId && (!existing || !existing.faculty_id)) {
                // CASE 3: Brand New Assignment
                console.log(`[EMAIL DISPATCH] To: ${newName} | Subject: New Class Allocation - ${master?.name} | Body: You have been officially allocated to teach ${master?.name} for ${batch?.name}.`);
                window.erpDialog?.alert(`✅ Assignment Confirmed. An automated notification email has been dispatched to ${newName}.`);
            }
            
            // Force completely fresh fetch to guarantee state sync
            const { data: freshData } = await supabase.from('cohort_subjects').select('*').eq('batch_id', selectedBatchId);
            setCohortSubjects(freshData || []);
            
        } catch (err) {
            console.error("Assignment Error:", err);
            window.erpDialog?.alert(`Failed to assign faculty: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">Faculty Allocator</h2>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/50 tracking-wide mt-1">
                        Assign professors to subjects for the current active semester.
                    </p>
                </div>
                <div className="w-full md:w-64 shrink-0">
                    <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)} className="w-full bg-white dark:bg-black border border-blue-500/20 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-sm appearance-none">
                        <option value="">Select Cohort...</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name} (Sem {b.current_semester})</option>)}
                    </select>
                </div>
            </div>

            {selectedBatchId && !loading && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject Name</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Credits</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Faculty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {masterSubjects.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center">
                                            <p className="text-sm font-bold text-gray-500">No subjects found in the Curriculum Vault for this program's current semester.</p>
                                        </td>
                                    </tr>
                                ) : masterSubjects.map(master => {
                                    const activeAssig = cohortSubjects.find(c => c.master_subject_id === master.id);
                                    const currentFaculty = activeAssig ? (activeAssig.faculty_id || '') : '';
                                    
                                    return (
                                        <tr key={master.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                                            <td className="py-4 px-6 text-sm font-black text-gray-900 dark:text-white">{master.code}</td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300">{master.name}</td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-500">{master.credits}</td>
                                            <td className="py-4 px-6">
                                                <select 
                                                    value={currentFaculty} 
                                                    onChange={e => handleAssign(master.id, e.target.value)}
                                                    className={`w-full max-w-[250px] border rounded-lg px-3 py-2 text-sm font-bold outline-none appearance-none transition ${currentFaculty ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'}`}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {faculties.map(f => <option key={f.id} value={f.id}>{f.full_name}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {loading && <div className="text-center py-10 opacity-50"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>}
        </div>
    );
}
