/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../context/ErpContext';

export default function ForcePasswordChangeModal({ onComplete }) {
    const { userSession } = useERP();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            // Update Auth Password (Supabase handles bcrypt hashing automatically)
            const { error: authError } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (authError) throw authError;

            // Clear the flag in profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ force_password_change: false })
                .eq('id', userSession.db_id)
                .select()
                .single();
            
            if (profileError) throw profileError;

            onComplete();

        } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md animate-fade-in flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-themePanel p-8 rounded-2xl shadow-2xl flex flex-col gap-6">
                
                <div className="text-center">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h3 className="text-xl font-black text-themeText dark:text-white">Security Update Required</h3>
                    <p className="text-xs font-bold text-themeTextSec mt-2 leading-relaxed">
                        Your account was provisioned with a temporary passcode. For your security, please set a new permanent password.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-rose-500/10 text-rose-500 p-3 rounded-lg text-xs font-bold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">New Password</label>
                        <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-rose-500" placeholder="Min 6 characters" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Confirm Password</label>
                        <input type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-rose-500" placeholder="Confirm your new password" />
                    </div>

                    <button type="submit" disabled={isLoading || !newPassword || !confirmPassword} className="w-full py-4 mt-2 bg-rose-500 hover:bg-rose-400 rounded-xl text-white text-sm font-black transition disabled:opacity-50 flex justify-center items-center gap-2 disabled:cursor-not-allowed">
                        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-lock"></i>}
                        {isLoading ? 'Encrypting...' : 'Save & Continue'}
                    </button>
                </form>

            </div>
        </div>
    );
}
