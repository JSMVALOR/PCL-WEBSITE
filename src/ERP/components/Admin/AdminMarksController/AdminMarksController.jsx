/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";
import PageHeader from "../../shared/PageHeader/PageHeader";

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
                .select('*, faculty:faculty_id(full_name), student:student_id(full_name, roll_number, erp_id), subject:subject_id(name, code)')
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
                .select('marks_obtained, student:student_id(roll_number, full_name, erp_id)')
                .eq('subject_id', sub.subject_id)
                .eq('assessment_type', sub.assessment_type)
                .order('student_id', { ascending: true }); // Need a join sort, but JS sort is fine
                
            if (error) throw error;
            if (!marks || marks.length === 0) {
                window.erpDialog?.alert("No marks found to export.");
                return;
            }

            // Sort by roll number
            const sortedMarks = marks.sort((a, b) => (a.student.roll_number || '').localeCompare(b.student.roll_number || ''));

            // Build CSV
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `OSMANIA UNIVERSITY INTERNAL ASSESSMENT EXPORT\n`;
            csvContent += `Subject:,${(sub.master_subjects?.name || sub.master_subjects?.name || "")} (${(sub.master_subjects?.code || sub.subjects?.code || "")})\n`;
            csvContent += `Batch:,${sub.batch}\n`;
            csvContent += `Assessment:,${sub.assessment_type}\n`;
            csvContent += `Faculty:,${sub.profiles.full_name}\n`;
            csvContent += `Submitted At:,${new Date(sub.submitted_at).toLocaleDateString()}\n\n`;
            
            csvContent += "Roll Number,Registration No,Student Name,Marks Obtained,Max Marks\n";
            
            // Note: Max marks could be dynamic, but for OU usually 20 or 30. Hardcoding 20 or allowing input is possible, we just output what we have.
            sortedMarks.forEach(m => {
                const row = `"${m.student.roll_number}","${m.student.erp_id}","${m.student.full_name}","${m.marks_obtained}","20"`;
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `OU_Export_${sub.batch}_${sub.assessment_type}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Export Error:", e);
            window.erpDialog?.alert("Failed to export OU sheet.");
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
                                            <button onClick={() => exportToCSV(sub)} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ml-auto border border-emerald-500/20 hover:border-emerald-500">
                                                <i className="fa-solid fa-file-csv text-sm"></i> Download CSV
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                            <p className="text-[10px] font-mono text-themeTextSec">{req.student?.erp_id} | {req.student?.roll_number}</p>
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
