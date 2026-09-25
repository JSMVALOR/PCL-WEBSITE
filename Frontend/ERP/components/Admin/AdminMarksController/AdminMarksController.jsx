/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { generateBeautifulExcel } from '../../../../Shared/utils/ExcelExport';

export default function AdminMarksController() {
    const { userSession } = useERP();
    const [activeTab, setActiveTab] = useState("submissions"); // submissions, corrections
    
    // Submissions State
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubs, setLoadingSubs] = useState(true);
    
    // Corrections State
    const [correctionRequests, setCorrectionRequests] = useState([]);
    const [loadingCorrections, setLoadingCorrections] = useState(true);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        fetchSubmissions();
        fetchCorrections();
    }, []);

    const fetchSubmissions = async () => {
        setLoadingSubs(true);
        try {
            const { data, error } = await supabase
                .from('marks_submissions')
                .select('*, profiles:faculty_id(full_name), master_subjects:subject_id(name, code)')
                .order('submitted_at', { ascending: false });
            if (!error && data) setSubmissions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSubs(false);
        }
    };

    const fetchCorrections = async () => {
        setLoadingCorrections(true);
        try {
            const { data, error } = await supabase
                .from('mark_correction_requests')
                .select('*, faculty:profiles!mark_correction_requests_faculty_id_fkey(full_name), student:profiles!mark_correction_requests_student_id_fkey(full_name, erp_id), subject:master_subjects(name, code)')
                .order('created_at', { ascending: false });
            if (!error && data) setCorrectionRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCorrections(false);
        }
    };

    const handleResolveRequest = async (reqId, accept = true) => {
        setIsResolving(true);
        try {
            const targetReq = correctionRequests.find(r => r.id === reqId);
            if (!targetReq) return;

            if (accept) {
                // Update marks_ledger securely as Admin
                const { error: updateErr } = await supabase
                    .from('marks_ledger')
                    .update({ marks_obtained: targetReq.requested_mark })
                    .eq('student_id', targetReq.student_id)
                    .eq('subject_id', targetReq.subject_id)
                    .eq('assessment_type', targetReq.assessment_type);
                if (updateErr) throw updateErr;
            }

            // Update ticket status
            const statusStr = accept ? 'approved' : 'rejected';
            await supabase
                .from('mark_correction_requests')
                .update({ status: statusStr, resolved_by: userSession.db_id, resolved_at: new Date().toISOString() })
                .eq('id', reqId);
                
            window.erpDialog?.alert(`Request ${statusStr.toUpperCase()} successfully.`);
            fetchCorrections();
        } catch (error) {
            console.error(error);
            window.erpDialog?.alert("Error resolving request.");
        } finally {
            setIsResolving(false);
        }
    };

    const exportToCSV = async (sub) => {
        try {
            // Fetch all marks for this specific submission lock
            const { data: marks, error } = await supabase
                .from('marks_ledger')
                .select('marks_obtained, max_marks, student:profiles!marks_ledger_student_id_fkey(full_name, erp_id)')
                .eq('subject_id', sub.subject_id)
                .eq('assessment_type', sub.assessment_type)
                .order('student_id', { ascending: true }); // Need a join sort, but JS sort is fine
                
            if (error) throw error;
            if (!marks || marks.length === 0) {
                window.erpDialog?.alert("No marks found to export.");
                return;
            }

            // Sort by roll number
            const sortedMarks = marks.sort((a, b) => (a.student.erp_id || '').localeCompare(b.student.erp_id || ''));

            // Prepare Data for Excel
            const title = "OSMANIA UNIVERSITY INTERNAL ASSESSMENT EXPORT";
            
            const metaData = [
                { label: "Subject:", value: `${sub.master_subjects?.name || sub.subjects?.name || ""} (${sub.master_subjects?.code || sub.subjects?.code || ""})` },
                { label: "Batch:", value: sub.batch },
                { label: "Assessment:", value: sub.assessment_type },
                { label: "Faculty:", value: sub.profiles.full_name },
                { label: "Submitted At:", value: new Date(sub.submitted_at).toLocaleDateString() }
            ];

            const columns = ["Roll Number", "Registration No", "Student Name", "Marks Obtained", "Max Marks"];
            
            const dataRows = sortedMarks.map(m => [
                m.student.erp_id || "N/A",
                m.student.erp_id || "N/A",
                m.student.full_name || "N/A",
                m.marks_obtained,
                m.max_marks || 20 // Uses the db-stored max marks (default 20 fallback)
            ]);

            const filename = `OU_Export_${sub.batch}_${sub.assessment_type}`;

            await generateBeautifulExcel(title, metaData, columns, dataRows, filename);
            
        } catch (e) {
            console.error("Export Error:", e);
            window.erpDialog?.alert("Failed to export OU sheet.");
        }
    };

    const handleEditMaxMarks = async (sub) => {
        const val = await window.erpDialog?.prompt(`Enter the maximum marks for ${sub.master_subjects?.name} (${sub.assessment_type}):`, "Set Max Marks", "20");
        if (val) {
            const newMax = Number(val);
            if (isNaN(newMax) || newMax <= 0) {
                window.erpDialog?.alert("Invalid max marks value.");
                return;
            }
            try {
                const { error } = await supabase
                    .from('marks_ledger')
                    .update({ max_marks: newMax })
                    .eq('subject_id', sub.subject_id)
                    .eq('assessment_type', sub.assessment_type);
                if (error) throw error;
                window.erpDialog?.alert(`Max marks successfully updated to ${newMax} for all students in this assessment.`, "Success");
            } catch(e) {
                console.error(e);
                window.erpDialog?.alert("Failed to update max marks.");
            }
        }
    };

    return (
        <div className="w-full animate-fade-in pb-12 font-sans bg-themeApp min-h-screen text-themeText">
            <div className="w-full mx-auto px-4 lg:px-8 py-6">
                <PageHeader 
                    icon="fa-solid fa-building-columns" 
                    title="OU Marks Dispatcher" 
                    subtitle="Track faculty internal submissions, resolve edit requests, and generate Osmania University exports." 
                />

                <div className="flex border-b border-themeBorder/50 mb-8 mt-6 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab("submissions")} className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition border-b-2 whitespace-nowrap ${activeTab === "submissions" ? "border-themeAccent text-themeText" : "border-transparent text-themeTextSec hover:text-themeText"}`}>
                        <i className="fa-solid fa-lock mr-2"></i> Locked Submissions
                    </button>
                    <button onClick={() => setActiveTab("corrections")} className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition border-b-2 whitespace-nowrap ${activeTab === "corrections" ? "border-blue-500 text-blue-500" : "border-transparent text-themeTextSec hover:text-themeText"}`}>
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i> Correction Tickets
                        {correctionRequests.filter(r => r.status === 'pending').length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white rounded-full text-[10px]">{correctionRequests.filter(r => r.status === 'pending').length}</span>
                        )}
                    </button>
                </div>

                {/* TAB 1: LOCKED SUBMISSIONS */}
                {activeTab === "submissions" && (
                    <div className="bg-themeElevated/20 border border-themeBorder/50 rounded-2xl overflow-hidden backdrop-blur-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-themeElevated/30 border-b border-themeBorder/50">
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Assessment</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Batch & Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec">Submitted By</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-themeTextSec text-right">OU Export</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingSubs && <tr><td colSpan="5" className="p-8 text-center text-sm font-bold text-themeTextSec"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading Locks...</td></tr>}
                                {!loadingSubs && submissions.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-sm font-bold text-themeTextSec">No locked assessments found.</td></tr>}
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="border-b border-themeBorder/50 hover:bg-themeElevated/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-themeText">{sub.assessment_type}</span>
                                            <p className="text-[10px] text-themeTextSec font-bold tracking-widest uppercase mt-1">{new Date(sub.submitted_at).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-themeText">{sub.batch}</span>
                                            <p className="text-[10px] text-themeTextSec mt-1">{sub.master_subjects?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-themeText">
                                            {sub.profiles?.full_name}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-md border border-red-500/20"><i className="fa-solid fa-lock"></i> Locked</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-2 ml-auto w-fit">
                                                <button onClick={() => exportToCSV(sub)} className="px-4 py-2 w-full justify-center bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 border border-emerald-500/20 hover:border-emerald-500">
                                                    <i className="fa-solid fa-file-csv text-sm"></i> Download CSV
                                                </button>
                                                <button onClick={() => handleEditMaxMarks(sub)} className="px-4 py-2 w-full justify-center bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 border border-blue-500/20 hover:border-blue-500">
                                                    <i className="fa-solid fa-sliders text-sm"></i> Set Max Marks
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: MANUAL OVERRIDE */}
                {activeTab === "override" && (
                    <ManualOverrideTab />
                )}

                {/* TAB 2: CORRECTION TICKETS */}
                {activeTab === "corrections" && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {loadingCorrections && <div className="col-span-2 p-8 text-center text-sm font-bold text-themeTextSec"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading Tickets...</div>}
                        {!loadingCorrections && correctionRequests.length === 0 && <div className="col-span-2 p-8 text-center text-sm font-bold text-themeTextSec">No correction requests found. Everything is secure.</div>}
                        
                        {correctionRequests.map(req => (
                            <div key={req.id} className="bg-white/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4 border-b border-themeBorder/50 pb-4">
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-themeText mb-1">{req.student?.full_name}</h3>
                                            <p className="text-[10px] font-mono text-themeTextSec">{req.student?.erp_id} | {req.student?.erp_id}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${req.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {req.status}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4 bg-themeElevated/30 p-4 rounded-xl border border-themeBorder/50">
                                        <div>
                                            <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Old Mark</p>
                                            <p className="text-xl font-mono text-red-500 line-through decoration-red-500/50">{req.old_mark}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Requested Mark</p>
                                            <p className="text-xl font-mono font-black text-emerald-500">{req.requested_mark}</p>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Faculty Reason</p>
                                        <p className="text-xs text-themeText italic border-l-2 border-themeAccent pl-3 py-1">"{req.reason}"</p>
                                        <p className="text-[10px] text-themeTextSec mt-2 font-bold">— Requested by {req.faculty?.full_name} for {req.subject?.name} ({req.assessment_type})</p>
                                    </div>
                                </div>
                                {req.status === 'pending' && (
                                    <div className="flex gap-3 mt-4 pt-4 border-t border-themeBorder/50">
                                        <button onClick={() => handleResolveRequest(req.id, false)} disabled={isResolving} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-black transition-colors border border-red-500/20">
                                            Reject
                                        </button>
                                        <button onClick={() => handleResolveRequest(req.id, true)} disabled={isResolving} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-colors shadow-lg shadow-blue-500/20">
                                            Accept & Apply Change
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


const ManualOverrideTab = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMark, setEditMark] = useState(null);

    const searchStudents = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data } = await supabase.from('profiles').select('id, full_name, erp_id, academic_batch').eq('role', 'student').ilike('full_name', `%${searchQuery}%`).limit(10);
        setStudents(data || []);
        setLoading(false);
    };

    const fetchMarks = async (student) => {
        setSelectedStudent(student);
        setLoading(true);
        const { data } = await supabase.from('marks_ledger').select('*, master_subjects(name, code)').eq('student_id', student.id).order('created_at', { ascending: false });
        setMarks(data || []);
        setLoading(false);
    };

    const handleSaveOverride = async () => {
        if (!editMark || !editMark.id) return;
        if (!(await window.erpDialog?.confirm(`Override mark to ${editMark.marks_obtained}?`))) return;
        
        try {
            const { error } = await supabase.from('marks_ledger').update({
                marks_obtained: editMark.marks_obtained,
                max_marks: editMark.max_marks,
                updated_at: new Date().toISOString()
            }).eq('id', editMark.id);
            if (error) throw error;
            window.erpDialog?.alert('Mark overridden successfully.', 'Success');
            setEditMark(null);
            fetchMarks(selectedStudent);
        } catch(e) {
            window.erpDialog?.alert('Failed to override mark: ' + e.message);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <form onSubmit={searchStudents} className="flex gap-2">
                <input type="text" placeholder="Search student by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-white dark:bg-[#121212] border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none" />
                <button type="submit" className="bg-themeAccent text-white px-6 py-3 rounded-xl font-bold">Search</button>
            </form>

            {students.length > 0 && !selectedStudent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.map(s => (
                        <div key={s.id} onClick={() => fetchMarks(s)} className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-themeBorder rounded-2xl p-4 cursor-pointer hover:border-themeAccent/50 transition-colors">
                            <h4 className="font-bold text-sm">{s.full_name}</h4>
                            <p className="text-xs text-themeTextSec uppercase tracking-widest">{s.erp_id}</p>
                        </div>
                    ))}
                </div>
            )}

            {selectedStudent && (
                <div className="bg-white/70 dark:bg-[#121212] border border-themeBorder dark:border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">{selectedStudent.full_name}</h3>
                            <p className="text-xs text-themeTextSec">{selectedStudent.erp_id}</p>
                        </div>
                        <button onClick={() => setSelectedStudent(null)} className="text-sm font-bold text-themeAccent bg-themeAccent/10 px-4 py-2 rounded-lg">Back to Search</button>
                    </div>

                    {loading ? <div className="text-center py-10"><i className="fa-solid fa-spinner fa-spin"></i></div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-themeTextSec border-b border-themeBorder">
                                        <th className="py-3 pr-4">Subject</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Marks</th>
                                        <th className="py-3 pl-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marks.map(m => (
                                        <tr key={m.id} className="border-b border-black/[0.03] dark:border-white/[0.03]">
                                            <td className="py-3 pr-4 text-sm font-bold">{m.master_subjects?.name}</td>
                                            <td className="py-3 px-4 text-xs font-bold text-themeTextSec">{m.assessment_type}</td>
                                            <td className="py-3 px-4">
                                                {editMark?.id === m.id ? (
                                                    <div className="flex gap-2 items-center">
                                                        <input type="number" value={editMark.marks_obtained} onChange={e => setEditMark({...editMark, marks_obtained: Number(e.target.value)})} className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 rounded px-2 py-1 outline-none text-sm font-bold text-center" title="Marks Obtained" />
                                                        <span className="text-themeTextSec">/</span>
                                                        <input type="number" value={editMark.max_marks || editMark.total_marks || 20} onChange={e => setEditMark({...editMark, max_marks: Number(e.target.value)})} className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 rounded px-2 py-1 outline-none text-sm font-bold text-center" title="Max Marks" />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold">{m.marks_obtained}/{m.max_marks || m.total_marks}</span>
                                                )}
                                            </td>
                                            <td className="py-3 pl-4 text-right">
                                                {editMark?.id === m.id ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={handleSaveOverride} className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded text-xs font-bold">Save</button>
                                                        <button onClick={() => setEditMark(null)} className="text-themeTextSec bg-black/5 px-3 py-1 rounded text-xs font-bold">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setEditMark(m)} className="text-themeAccent bg-themeAccent/10 hover:bg-themeAccent/20 px-3 py-1 rounded text-xs font-bold transition-colors">Edit</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
