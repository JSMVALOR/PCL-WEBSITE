/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Achievements from '../Achievements/Achievements';
import CVBuilder from '../CVBuilder/CVBuilder';

export default function Portfolio() {
    const [activeTab, setActiveTab] = useState('achievements');

    return (
        <div className="w-full h-auto xl:h-full min-h-full relative flex-1 bg-themeApp text-themeText selection:bg-themeAccent/30 overflow-x-hidden xl:overflow-hidden font-sans flex flex-col">
            <div className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 xl:pb-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
                
                {/* Header & Tabs */}
                <div className="shrink-0 flex flex-col gap-6 bg-white/70 dark:bg-themePanel/70 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-[2rem] p-6 lg:p-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-themeAccent to-blue-600 text-white flex items-center justify-center shadow-lg shadow-themeAccent/20">
                                <i className="fa-solid fa-briefcase text-xl"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-themeText tracking-tight">Career Portfolio</h1>
                                <p className="text-xs lg:text-sm font-bold text-themeTextSec">Manage your achievements and generate your professional CV.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap p-1.5 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 gap-1.5 w-fit">
                        {[
                            { id: 'achievements', label: 'My Achievements', icon: 'fa-trophy' },
                            { id: 'cvbuilder', label: 'CV Generator', icon: 'fa-file-pdf' }
                        ].map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-6 py-2.5 rounded-xl text-xs lg:text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 ${
                                    activeTab === t.id 
                                    ? 'bg-white dark:bg-white/20 text-themeText shadow-sm scale-100 border border-black/5 dark:border-white/20' 
                                    : 'text-themeTextSec opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 scale-95 hover:scale-100 border border-transparent'
                                }`}
                            >
                                <i className={`fa-solid ${t.icon}`}></i> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white/40 dark:bg-themePanel/40 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full"
                        >
                            {activeTab === 'achievements' && <Achievements isEmbedded={true} onNavigateToCV={() => setActiveTab('cvbuilder')} />}
                            {activeTab === 'cvbuilder' && <CVBuilder isEmbedded={true} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
