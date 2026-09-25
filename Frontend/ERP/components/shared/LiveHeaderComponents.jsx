/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { theme } from '../../../Shared/theme';

export function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateStr = time.toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = time.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className={`hidden lg:flex items-center px-4 py-2 rounded-themePanel ${theme.layout.panelElevated} ${theme.text.overline} text-themeText font-mono tracking-tighter shrink-0`}>
            <i className="fa-regular fa-clock mr-2 text-themeAccent"></i>
            {dateStr} <span className="opacity-40 mx-2">•</span> {timeStr}
        </div>
    );
}

export function GlobalSearch() {
    return (
        <div className="hidden xl:flex items-center w-full min-w-[150px] max-w-[220px] group mr-2">
            <div className={`w-full flex items-center px-4 py-2.5 rounded-themeBtn bg-themePanel/85 backdrop-blur-2xl shadow-premium border border-themeBorder dark:border-white/5 focus-within:border-themeAccent transition hover:border-black/5 dark:border-white/10 shadow-sm`}>
                <i className="fa-solid fa-magnifying-glass text-themeTextSec opacity-50 group-focus-within:text-themeAccent transition-colors text-xs"></i>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-transparent border-none outline-none text-themeText text-xs font-medium ml-2.5 placeholder-themeTextSec placeholder-opacity-50 min-w-0"
                />
                <div className="hidden 2xl:flex items-center justify-center px-1.5 py-0.5 rounded bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-themeBorder dark:border-white/5 text-[9px] font-black text-themeTextSec opacity-70 ml-2 shadow-premiumElevated shrink-0">
                    ⌘K
                </div>
            </div>
        </div>
    );
}

export function RoleActionButton({ role, setActiveTab }) {
    const config = {
        student: { label: "Submit Task", icon: "fa-cloud-arrow-up", tab: "assignments" },
        faculty: { label: "My Courses", icon: "fa-book-open", tab: "materials" },
        admin: { label: "New Notice", icon: "fa-bullhorn", tab: "notices" }
    };

    const action = config[role] || config.student;

    return (
        <button type="button" 
            onClick={() => setActiveTab(action.tab)}
            className={`hidden xl:flex items-center px-5 py-2.5 rounded-full bg-themeAccent/10 hover:bg-themeAccent/20 text-themeAccent text-[10px] font-black uppercase tracking-[0.1em] border border-themeAccent/20 hover:border-themeAccent/50 transition duration-300 shadow-sm shrink-0`}
        >
            <i className={`fa-solid ${action.icon} mr-2`}></i> {action.label}
        </button>
    );
}
