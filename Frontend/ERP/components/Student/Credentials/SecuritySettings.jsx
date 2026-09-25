/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../Shared/lib/supabase/supabaseClient";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";

export default function SecuritySettings() {
    const { userSession } = useERP();
    const [passwords, setPasswords] = useState({ new: "", confirm: "" });
    const [isUpdating, setIsUpdating] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchSessions = async () => {
            try {
                if (isMounted) {
                    setSessions([
                        {
                            id: 'current',
                            device: navigator.userAgent.includes("Mac") ? "macOS (Apple Silicon)" : "Windows PC",
                            location: "Local Network",
                            isActive: true
                        }
                    ]);
                }
            } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchSessions();
        return () => { isMounted = false; };
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setStatusMessage({ type: "error", text: "Identity keys do not match." });
            return;
        }
        if (passwords.new.length < 8) {
            setStatusMessage({ type: "error", text: "Key must be at least 8 characters." });
            return;
        }

        setIsUpdating(true);
        setStatusMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.new });
            if (error) throw error;
            setStatusMessage({ type: "success", text: "Identity key successfully updated." });
            setPasswords({ new: "", confirm: "" });
        } catch (error) {
            setStatusMessage({ type: "error", text: error.message || "Failed to update key." });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGlobalLogout = async () => {
        setIsLoggingOut(true);
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 lg:gap-4">
                <div className={`${theme.ui.logoBox} text-themeAccent border-themeBorderStrong bg-themePanel`}>
                    <i className="fa-solid fa-shield-check text-xl"></i>
                </div>
                <div>
                    <h2 className={`${theme.text.heading} text-lg lg:text-2xl`}>Security & Access</h2>
                    <p className={`${theme.text.secondary} text-xs tracking-normal mt-1`}>Manage your authentication and active sessions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                
                {/* Identity Management */}
                <div className="flex flex-col gap-5">
                    <h3 className={`text-[14px] font-medium text-themeText tracking-normal flex items-center gap-2 px-1`}>
                        <i className="fa-solid fa-key text-themeAccent"></i> Identity Management
                    </h3>

                    <form onSubmit={handlePasswordUpdate} className={`${theme.layout.panel} rounded-themePanel p-5 lg:p-6 flex flex-col gap-4 border border-themeBorder`}>
                        {statusMessage && (
                            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                statusMessage.type === "success" 
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}>
                                <i className={`fa-solid ${statusMessage.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
                                {statusMessage.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className={`${theme.text.label} tracking-normal ml-1`}>New Password</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                                className={`${theme.inputs.base} ${theme.inputs.elevated} text-sm px-4 py-3 rounded-xl`}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={`${theme.text.label} tracking-normal ml-1`}>Confirm New Password</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                                className={`${theme.inputs.base} ${theme.inputs.elevated} text-sm px-4 py-3 rounded-xl`}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdating || !passwords.new}
                            className={`${theme.action.btnPrimary} w-full py-3.5 mt-2 rounded-[2rem] text-[14px] font-medium tracking-normal flex items-center justify-center gap-2 disabled:opacity-50 transition-all`}
                        >
                            {isUpdating ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Propagating...</> : "Update Identity Key"}
                        </button>
                    </form>
                </div>

                {/* Session Telemetry */}
                <div className="flex flex-col gap-5">
                    <h3 className={`text-[14px] font-medium text-themeText tracking-normal flex items-center gap-2 px-1`}>
                        <i className="fa-solid fa-satellite-dish text-themeAccent"></i> Active Telemetry
                    </h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-3xl"></i>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {sessions.map((session) => (
                                <div key={session.id} className={`${theme.layout.panel} border border-themeBorder p-5 rounded-themePanel flex items-center justify-between`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-themeElevated rounded-2xl flex items-center justify-center text-emerald-500 text-xl shrink-0 border border-themeBorder">
                                            <i className="fa-solid fa-laptop"></i>
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold text-themeText">{session.device}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black text-emerald-500 tracking-normal flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Live Session
                                                </span>
                                                <span className="w-1 h-1 bg-themeBorderStrong rounded-full shrink-0"></span>
                                                <span className={`${theme.text.muted} text-[12px] font-medium`}>{session.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <i className="fa-solid fa-shield-check text-emerald-500 text-xl mr-2"></i>
                                </div>
                            ))}

                            <button type="button"
                                onClick={handleGlobalLogout}
                                disabled={isLoggingOut}
                                className={`${theme.layout.panel} border border-themeBorder p-5 w-full flex items-center justify-center gap-3 text-rose-500 hover:bg-rose-500 hover:text-themeText dark:text-white transition-colors duration-300 rounded-themePanel`}
                            >
                                {isLoggingOut ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : <i className="fa-solid fa-power-off text-lg"></i>}
                                <span className="font-black tracking-normal text-xs">Log out from all devices</span>
                            </button>

                            <div className={`${theme.layout.panel} border border-themeBorder p-5 rounded-themePanel flex items-start gap-4`}>
                                <i className="fa-solid fa-circle-info text-themeAccent mt-0.5 text-lg"></i>
                                <p className={`text-[10px] font-medium ${theme.text.secondary} leading-relaxed`}>
                                    <strong className="text-themeText block mb-1 font-bold tracking-normal text-[9px]">Security Protocol:</strong>
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
