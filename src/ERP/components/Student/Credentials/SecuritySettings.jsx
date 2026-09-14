/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function SecuritySettings() {
    const { userSession } = useERP();

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    const [passwords, setPasswords] = useState({
        new: "",
        confirm: ""
    });

    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData.session) {
                    setSessions([
                        {
                            id: sessionData.session.access_token.substring(0, 8),
                            device: "Current Device",
                            browser: "Verified Browser",
                            location: "Secured Connection",
                            isCurrent: true,
                            lastActive: "Now"
                        }
                    ]);
                }
            } catch (err) {
                console.error("Security sync failed:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwords.new !== passwords.confirm) {
            window.erpDialog?.alert("Passwords do not match.");
            return;
        }

        // Ask to confirm passcode twice as requested
        const confirm1 = await window.erpDialog?.confirm("Are you absolutely sure you want to change your Master Password?");
        if (!confirm1) return;
        
        const confirm2 = await window.erpDialog?.confirm("Final Confirmation: If you forget this password, you will need an IT ticket to recover access. Proceed?");
        if (!confirm2) return;

        setIsUpdating(true);
        setStatusMessage({ type: "", text: "" });

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            setStatusMessage({ type: "success", text: "Identity credentials updated successfully." });
            setPasswords({ new: "", confirm: "" });
        } catch (err) {
            setStatusMessage({ type: "error", text: err.message });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGlobalLogout = async () => {
        const confirmed = await window.erpDialog?.confirm("Are you sure you want to log out from ALL devices?");
        if (!confirmed) return;

        setIsLoggingOut(true);
        try {
            // scope: 'global' logs out from all devices, including the current one.
            const { error } = await supabase.auth.signOut({ scope: 'global' });
            if (error) throw error;
            // The auth listener in ErpContext will detect logout and redirect automatically
            window.location.reload();
        } catch (err) {
            window.erpDialog?.alert("Failed to log out from all devices.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/[0.04] dark:border-white/[0.08] pb-4 lg:pb-6 gap-4">
                <div>
                    <h2 className="font-serif font-semibold tracking-tight text-[#007AFF] text-lg lg:text-xl">
                        Security & Access
                    </h2>
                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 mt-0.5">
                        Manage your encryption and active sessions
                    </p>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] rounded-[2rem] flex items-center justify-center text-rose-500 shrink-0 hidden sm:flex">
                    <i className="fa-solid fa-shield-halved text-xl lg:text-2xl"></i>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Change Password Engine */}
                <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-5 lg:p-6 rounded-[2rem] flex flex-col gap-5 lg:gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-3xl"></div>

                    <h3 className="text-[10px] lg:text-xs font-black text-[#1C1C1E] dark:text-[#F2F2F7] uppercase tracking-widest flex items-center gap-2 relative z-10">
                        <i className="fa-solid fa-key text-[#007AFF]"></i> Update Master Password
                    </h3>

                    <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4 lg:gap-5 relative z-10">
                        {statusMessage.text && (
                            <div className={`p-4 rounded-[2rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${statusMessage.type === "success" ? "bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] text-emerald-500" : "bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] text-rose-500"}`}>
                                <i className={`fa-solid ${statusMessage.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
                                {statusMessage.text}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[9px] lg:text-[10px] font-black text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 uppercase tracking-widest ml-1">New Password</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                                className="bg-black/5 dark:bg-white/10 backdrop-blur-md border border-transparent rounded-xl px-4 py-3 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] focus:border-[#007AFF]/50 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all placeholder:text-[#3A3A3C]/50 dark:placeholder:text-[#EBEBF5]/50"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] lg:text-[10px] font-black text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                                className="bg-black/5 dark:bg-white/10 backdrop-blur-md border border-transparent rounded-xl px-4 py-3 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] focus:border-[#007AFF]/50 focus:bg-white dark:focus:bg-[#2C2C2E] outline-none transition-all placeholder:text-[#3A3A3C]/50 dark:placeholder:text-[#EBEBF5]/50"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdating || !passwords.new}
                            className="w-full py-3.5 lg:py-4 mt-2 bg-gradient-to-br from-[#007AFF] to-[#0056b3] hover:shadow-[0_4px_15px_rgba(0,122,255,0.4)] text-white rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Propagating...</> : "Update Identity Key"}
                        </button>
                    </form>
                </div>

                {/* Session Telemetry */}
                <div className="flex flex-col gap-4 lg:gap-5">
                    <h3 className="text-[10px] lg:text-xs font-black text-[#1C1C1E] dark:text-[#F2F2F7] uppercase tracking-widest flex items-center gap-2 px-1">
                        <i className="fa-solid fa-satellite-dish text-[#007AFF]"></i> Active Telemetry
                    </h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 lg:py-16">
                            <i className="fa-solid fa-circle-notch fa-spin text-[#007AFF] text-2xl lg:text-3xl"></i>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 lg:gap-4">
                            {sessions.map((session) => (
                                <div key={session.id} className="bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] p-4 lg:p-5 rounded-[2rem] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black/5 dark:bg-white/10 rounded-[2rem] flex items-center justify-center text-emerald-500 text-lg lg:text-xl shrink-0 shadow-inner border border-black/[0.04] dark:border-white/[0.08]">
                                            <i className="fa-solid fa-laptop"></i>
                                        </div>
                                        <div>
                                            <p className="text-xs lg:text-sm font-black text-[#1C1C1E] dark:text-[#F2F2F7]">{session.device}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 mt-0.5 lg:mt-1">
                                                <span className="text-[8px] lg:text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Live Session
                                                </span>
                                                <span className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full shrink-0"></span>
                                                <span className="text-[8px] lg:text-[9px] font-bold text-[#3A3A3C]/70 dark:text-[#EBEBF5]/70 uppercase tracking-widest">{session.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-shield-check text-emerald-500 text-lg lg:text-xl mr-1 lg:mr-2"></i>
                                </div>
                            ))}

                            <button type="button"
                                onClick={handleGlobalLogout}
                                disabled={isLoggingOut}
                                className="bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.1)] p-4 lg:p-5 w-full flex items-center justify-center gap-3 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors duration-300 rounded-[2rem]"
                            >
                                {isLoggingOut ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-power-off text-lg"></i>}
                                <span className="font-black uppercase tracking-widest text-[10px] lg:text-xs">Log out from all devices</span>
                            </button>

                            <div className="mt-2 lg:mt-4 p-4 lg:p-5 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] flex flex-col sm:flex-row items-start gap-3 lg:gap-4">
                                <i className="fa-solid fa-circle-info text-[#007AFF] mt-1 text-lg"></i>
                                <p className="text-[9px] lg:text-[10px] font-medium text-[#3A3A3C]/80 dark:text-[#EBEBF5]/80 leading-relaxed">
                                    <strong className="text-[#1C1C1E] dark:text-[#F2F2F7] block mb-0.5 lg:mb-1 font-bold uppercase tracking-widest text-[8px] lg:text-[9px]">Security Protocol:</strong>
                                    Avoid sharing your ERP credentials. We recommend changing your password every 90 days to maintain institutional compliance.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
