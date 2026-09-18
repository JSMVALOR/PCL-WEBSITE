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

    const userName = (userSession?.full_name || userSession?.name || 'User').split(' ')[0]; // Use first name for friendlier greeting

    const getRoleInsignia = () => {
        if (role === 'admin') return <i className="fa-solid fa-shield-halved text-amber-500"></i>;
        if (role === 'faculty') return <i className="fa-solid fa-chalkboard-user text-indigo-500"></i>;
        return <i className="fa-solid fa-graduation-cap text-emerald-500"></i>;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-3xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden group"
        >
            

            <div className="flex items-center gap-6 z-10">
                {/* Left Insignia Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-white dark:bg-[#2C2C2E] p-1 shadow-none border border-black/5 dark:border-white/10 shrink-0 relative overflow-hidden flex items-center justify-center text-3xl sm:text-4xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent dark:from-white/5 pointer-events-none"></div>
                    {getRoleInsignia()}
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                    <h1 className="text-xl sm:text-3xl font-black text-themeText tracking-tight flex items-center gap-3">
                        {greeting}, <span className="text-themeAccent">{userName}</span>
                    </h1>
                    <p className="text-[11px] sm:text-xs font-bold text-themeTextSec uppercase tracking-widest mt-1.5 opacity-80">
                        {subtitle}
                    </p>
                </div>
            </div>


        </motion.div>
    );
}
