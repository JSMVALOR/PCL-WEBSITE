import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { supabase } from "../../../Shared/lib/supabase/supabaseClient";
import { motion } from 'framer-motion';

export default function SystemUpdater({ children }) {
    const [updateRequired, setUpdateRequired] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    const checkForUpdates = async () => {
        if (!Capacitor.isNativePlatform()) {
            setIsChecking(false);
            return;
        }

        try {
            // Get local version
            const appInfo = await CapApp.getInfo();
            const localVersionCode = parseInt(appInfo.build, 10); // version_code (e.g. 20)

            // Get remote version
            const { data, error } = await supabase
                .from('app_releases')
                .select('*')
                .order('version_code', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Failed to check for updates:", error);
            }

            if (data && data.version_code > localVersionCode) {
                setUpdateInfo(data);
                if (data.is_mandatory) {
                    setUpdateRequired(true);
                }
            }
        } catch (err) {
            console.error("Update check error:", err);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkForUpdates();

        // Also check whenever the app comes to the foreground
        const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                checkForUpdates();
            }
        });

        return () => {
            sub.then(listener => listener.remove());
        };
    }, []);

    const handleDownloadUpdate = () => {
        if (updateInfo?.apk_url) {
            // Open the APK URL directly. Android will download it and prompt the package installer.
            window.location.href = updateInfo.apk_url;
        }
    };

    if (updateRequired && updateInfo) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl saturate-[1.8] p-6 text-center"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="w-full max-w-sm bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl overflow-hidden p-8 flex flex-col items-center text-center"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/20">
                        <i className="fa-solid fa-cloud-arrow-down text-white text-3xl animate-bounce"></i>
                    </div>
                    
                    <h1 className="text-[22px] font-bold text-[#1C1C1E] dark:text-[#F2F2F7] tracking-tight mb-2">System Update</h1>
                    <p className="text-[14px] text-[#8E8E93] font-medium mb-6 leading-relaxed">
                        A mandatory core update is available. You must install the latest version to continue accessing the ecosystem securely.
                    </p>

                    <div className="bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl p-4 w-full text-left mb-8 shadow-inner">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-black/5 dark:border-white/5">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8E8E93]">Version</span>
                            <span className="text-[13px] font-bold text-[#007AFF]">v {updateInfo.version_name}</span>
                        </div>
                        <div className="text-[13px] font-medium text-[#3A3A3C] dark:text-[#EBEBF5]/60 whitespace-pre-line leading-relaxed">
                            {updateInfo.release_notes || "Performance optimizations and stability improvements."}
                        </div>
                    </div>

                    <button 
                        onClick={handleDownloadUpdate}
                        className="w-full py-3.5 rounded-xl bg-[#007AFF] text-white font-bold text-[13px] uppercase tracking-widest flex justify-center items-center gap-3 shadow-sm hover:bg-[#006DEB] transition-colors"
                    >
                        <i className="fa-solid fa-download"></i>
                        Download & Install
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return children;
}
