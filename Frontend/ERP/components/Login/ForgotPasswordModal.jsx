/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';

export default function ForgotPasswordModal({ onClose }) {
    const [institutionalId, setInstitutionalId] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Very simple lookup to ensure the user exists before submitting a request
            // (We assume profiles table has erp_id or institutional ID mapping). 
            // If they don't, the admin will reject it anyway. We just insert the request.
            const { error: insertError } = await supabase
                .from('erp_password_reset_requests')
                .insert([{
                    institutional_id: institutionalId.trim().toLowerCase(),
                    reason: reason.trim()
                }]);

            if (insertError) throw insertError;
            
            setSuccess(true);
        } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-themeApp animate-fade-in font-sans overflow-y-auto">
            {/* Close Button - Moved outside the inner container to ensure it's always clickable and visible */}
            <button 
                aria-label="Action button" type="button"
                onClick={onClose}
                className="fixed top-6 right-6 lg:top-10 lg:right-10 w-12 h-12 rounded-md bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated hover:bg-themeBorder border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec hover:text-themeText transition outline-none z-[250] shadow-2xl cursor-pointer hover:scale-110"
            ><i className="fa-solid fa-times text-xl"></i></button>

            {/* Subtle Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-md bg-themeAccent opacity-[0.05] mix-blend-screen filter blur-[120px] animate-pulse-slow"></div>
            </div>

            <div className="w-full max-w-xl mx-auto p-6 lg:p-12 min-h-screen flex flex-col justify-center relative z-10">

                <div className="mb-8 relative z-10">
                    <div className="w-14 h-14 rounded-lg bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-black/5 dark:border-white/10 flex items-center justify-center mb-6 shadow-inner">
                        <i className="fa-solid fa-unlock-keyhole text-2xl text-themeAccent"></i>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-themeText tracking-tight mb-2">Account Recovery</h2>
                    <p className="text-xs font-bold text-themeTextSec leading-relaxed">
                        Submit a password reset request to the Administration. You will receive a temporary password once approved.
                    </p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-md bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                            <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight text-themeText mb-2">Request Submitted</h3>
                        <p className="text-xs font-bold text-themeTextSec mb-8">
                            Your request has been forwarded to the Administration. Please monitor your registered contact channels for updates.
                        </p>
                        <button type="button" 
                            onClick={onClose}
                            className="w-full py-4 rounded-lg bg-themeApp border border-themeBorder dark:border-white/5 hover:border-black/5 dark:border-white/10 text-[15px] font-semibold uppercase tracking-wider text-themeText transition"
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-lg text-xs font-bold flex items-start gap-3">
                                <i className="fa-solid fa-circle-exclamation shrink-0 mt-0.5"></i> 
                                <span className="leading-relaxed">{error}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
                                Institutional ID
                            </label>
                            <input
                                type="text"
                                value={institutionalId}
                                onChange={(e) => setInstitutionalId(e.target.value)}
                                className="w-full bg-themeApp border border-themeBorder dark:border-white/5 focus:border-themeAccent rounded-lg py-4 px-5 text-sm font-bold text-themeText uppercase outline-none transition placeholder:text-themeTextSec placeholder:font-normal placeholder:normal-case shadow-inner"
                                placeholder="e.g. PCL-STU-2026"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
                                Reason for Reset
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="w-full bg-themeApp border border-themeBorder dark:border-white/5 focus:border-themeAccent rounded-lg py-4 px-5 text-sm font-bold text-themeText outline-none transition placeholder:text-themeTextSec placeholder:font-normal resize-none shadow-inner"
                                placeholder="Briefly explain why you need a reset (e.g. Forgot password, locked out)"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !institutionalId || !reason}
                            className="tlh-btn w-full justify-center !py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</>
                            ) : (
                                <>Submit Request <i className="fa-solid fa-paper-plane text-sm"></i></>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
