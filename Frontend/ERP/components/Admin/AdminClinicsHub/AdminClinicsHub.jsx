/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState } from 'react';
import PageHeader from '../../shared/PageHeader/PageHeader';
import AdminMootCourt from '../AdminMootCourt/AdminMootCourt';
import AdminPlacements from '../AdminPlacements/AdminPlacements';
import AdminLegalAid from '../AdminLegalAid/AdminLegalAid';

export default function AdminClinicsHub() {
    const [activeTab, setActiveTab] = useState('mootcourt');

    const tabs = [
        { id: 'mootcourt', label: 'Moot Court Society', icon: 'fa-scale-balanced' },
        { id: 'placements', label: 'Placements & Internships', icon: 'fa-briefcase' },
        { id: 'legalaid', label: 'Legal Aid Clinic', icon: 'fa-hands-holding-child' }
    ];

    return (
        <div className="w-full animate-fade-in min-h-screen bg-transparent text-themeText">
            <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-10">
                <PageHeader 
                    icon="fa-solid fa-gavel" 
                    title="Clinical Programs & Placements" 
                    subtitle="Central command for Moots, Careers, and Legal Aid drives." 
                />

                <div className="flex flex-wrap gap-2 mb-2 bg-themePanel p-2 rounded-2xl border border-themeBorder w-fit shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={[
                                "px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                                activeTab === tab.id
                                    ? "bg-themeAccent text-white shadow-lg scale-100"
                                    : "text-themeTextSec hover:text-themeText hover:bg-black/5 dark:hover:bg-white/5 scale-95 hover:scale-100"
                            ].join(" ")}
                        >
                            <i className={"fa-solid " + tab.icon}></i> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="w-full">
                    {activeTab === 'mootcourt' && <AdminMootCourt />}
                    {activeTab === 'placements' && <AdminPlacements isEmbedded={true} isHubView={true} />}
                    {activeTab === 'legalaid' && <AdminLegalAid />}
                </div>
            </div>
        </div>
    );
}
