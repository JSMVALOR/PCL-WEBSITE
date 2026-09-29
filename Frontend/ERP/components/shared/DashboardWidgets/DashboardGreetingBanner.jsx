/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useERP } from '../../../context/ErpContext';

export default function DashboardGreetingBanner({ role = 'student' }) {
    const { userSession } = useERP();
    const [greeting, setGreeting] = useState('');
    const [icon, setIcon] = useState('');
    const [subtitle, setSubtitle] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        
        if (hour < 12) {
            setGreeting('Good Morning');
            setIcon('fa-sun');
            setSubtitle(role === 'admin' ? 'Central Command Operations Center.' : 'Ready to conquer the day?');
        } else if (hour < 17) {
            setGreeting('Good Afternoon');
            setIcon('fa-cloud-sun');
            setSubtitle(role === 'admin' ? 'System vitals operating optimally.' : 'Keep up the great momentum.');
        } else {
            setGreeting('Good Evening');
            setIcon('fa-moon');
            setSubtitle(role === 'admin' ? 'Evening protocols engaged.' : 'Wrapping up a productive day!');
        }
    }, [role]);

    const userName = userSession?.full_name || userSession?.name || 'User';

    const getRoleInsignia = () => {
        if (role === 'admin') return <i className="fa-solid fa-shield-halved text-amber-500"></i>;
        if (role === 'faculty') return <i className="fa-solid fa-chalkboard-user text-indigo-500"></i>;
        return <i className="fa-solid fa-graduation-cap text-emerald-500"></i>;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center justify-between relative overflow-hidden group pb-3 sm:pb-4 border-b border-black/[0.04] dark:border-white/[0.04]"
        >
            <div className="flex items-center gap-4 sm:gap-6 z-10 w-full">
                {/* Left Insignia Box - Kept for accent, but made more subtle */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-themeTextSec flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    {getRoleInsignia()}
                </div>

                {/* Text Content */}
                <div className="flex flex-col flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-4xl font-black text-themeText tracking-tight flex items-center gap-2 flex-wrap leading-none">
                        {greeting}, <span className="text-themeAccent truncate">{userName}</span>
                    </h1>
                    <p className="text-[10px] sm:text-xs font-bold text-themeTextSec uppercase tracking-widest mt-1.5 sm:mt-2 opacity-80 truncate">
                        {subtitle}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
