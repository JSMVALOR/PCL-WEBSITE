/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';

export default function CredentialVerification() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchVerificationData = async () => {
            try {
                // 1. Fetch Basic Profile
                const { data: prof, error: profError } = await supabase
                    .from('profiles')
                    .select('full_name, erp_id, department, academic_batch')
                    .eq('id', id)
                    .single();

                if (profError || !prof) throw new Error("Invalid or revoked credential link.");

                setProfile(prof);

                // 2. Fetch Verified Documents
                const { data: docs, error: docError } = await supabase
                    .from('student_documents')
                    .select('*')
                    .eq('student_id', id)
                    .eq('status', 'verified')
                    .order('created_at', { ascending: false });

                if (docError) throw docError;
                setDocuments(docs || []);

            } catch (err) {
                console.error(err);
                setErrorMsg(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVerificationData();
    }, [id]);

    const handlePreview = async (filePath) => {
        try {
            const { data, error } = await supabase.storage.from('digital_locker_vault').createSignedUrl(filePath, 60 * 5); // 5 mins
            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (e) {
            console.error(e);
            window.erpDialog?.alert("Failed to generate secure preview link.");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-screen bg-themeApp flex items-center justify-center">
                <div className="flex items-center gap-4 text-emerald-500 animate-pulse">
                    <i className="fa-solid fa-shield-halved text-4xl"></i>
                    <h2 className="text-xl font-bold tracking-widest uppercase">Verifying Cryptographic Ledger...</h2>
                </div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="w-full h-screen bg-themeApp flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#111] border border-rose-500/30 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-triangle-exclamation text-rose-500 text-2xl"></i>
                    </div>
                    <h2 className="text-rose-500 font-bold text-xl mb-2">Verification Failed</h2>
                    <p className="text-neutral-400 text-sm mb-8">{errorMsg}</p>
                    <Link to="/" className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors tracking-normal">
                        Return to Portal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-themeApp text-neutral-200 selection:bg-emerald-500/30 flex flex-col items-center py-12 px-4 sm:px-8">
            
            <div className="max-w-3xl w-full">
                
                {/* Header Header */}
                <div className="flex flex-col items-center justify-center mb-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                        <i className="fa-solid fa-shield-check text-emerald-500 text-3xl"></i>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-[3px] border-[#0a0a0a] flex items-center justify-center">
                            <i className="fa-solid fa-badge-check text-gray-900 dark:text-white text-[10px]"></i>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Official University Record</h1>
                    <p className="text-emerald-500/80 font-mono text-sm tracking-widest uppercase">Cryptographically Verified by ERP</p>
                </div>

                {/* Profile Data */}
                <div className="bg-[#111] border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <p className="text-neutral-500 text-xs font-bold tracking-normal mb-1">Student Name</p>
                            <p className="text-gray-900 dark:text-white font-medium text-lg">{profile.full_name}</p>
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs font-bold tracking-normal mb-1">ERP Registration ID</p>
                            <p className="text-gray-900 dark:text-white font-medium text-lg font-mono">{profile.erp_id || 'Pending'}</p>
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs font-bold tracking-normal mb-1">Program of Study</p>
                            <p className="text-gray-900 dark:text-white font-medium text-lg">{profile.department || 'B.B.A. LL.B. (Hons.)'}</p>
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs font-bold tracking-normal mb-1">Academic Batch</p>
                            <p className="text-gray-900 dark:text-white font-medium text-lg">{profile.academic_batch || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>

                {/* Verified Documents Vault */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-vault text-emerald-500"></i>
                    Verified Digital Locker
                </h3>

                <div className="space-y-4">
                    {documents.length === 0 ? (
                        <div className="bg-[#111] border border-neutral-800 border-dashed rounded-2xl p-8 text-center">
                            <i className="fa-regular fa-folder-open text-neutral-600 text-3xl mb-3"></i>
                            <p className="text-neutral-400 font-medium">No verified documents available in the public locker.</p>
                        </div>
                    ) : (
                        documents.map(doc => (
                            <div key={doc.id} className="bg-[#111] border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                                        <i className={`fa-solid ${doc.document_type?.includes('Transcript') ? 'fa-file-certificate' : 'fa-file-pdf'} text-neutral-400 group-hover:text-emerald-500 text-xl`}></i>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-medium mb-1 line-clamp-1">{doc.document_name}</h4>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-neutral-500 font-mono">{doc.file_size_kb} KB</span>
                                            <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
                                            <span className="text-emerald-500 font-bold tracking-normal flex items-center gap-1.5">
                                                <i className="fa-solid fa-check-circle"></i> Verified
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" 
                                    onClick={() => handlePreview(doc.file_path)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1a1a1a] hover:bg-emerald-500 hover:text-themeApp text-neutral-300 rounded-lg text-xs font-bold tracking-normal transition border border-neutral-800 hover:border-emerald-500 shrink-0"
                                >
                                    Preview Authenticated File
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-neutral-600 text-xs font-medium max-w-lg mx-auto">
                        This digital record is cryptographically tied to the University's core ERP system. Any modifications will instantly invalidate this link.
                    </p>
                </div>
            </div>
        </div>
    );
}
