/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import AdminSiteEditor from "../AdminSiteEditor/AdminSiteEditor";
import BlogManager from "../BlogManager/BlogManager";
import AdminPlacements from "../AdminPlacements/AdminPlacements";

export default function AdminWebsiteHub({ isEmbedded = false }) {
    const [activeTab, setActiveTab] = useState("editor");

    const tabs = [
        { id: "editor", label: "CMS Editor", icon: "fa-pen-nib" },
        { id: "blogs", label: "Blog Engine", icon: "fa-blog" },
        { id: "careers", label: "Careers & Drives", icon: "fa-briefcase" }
    ];

    return (
        <div className={`w-full animate-fade-in selection:bg-[#007AFF]/20 ${!isEmbedded ? "min-h-screen bg-transparent text-[#1C1C1E] dark:text-[#F2F2F7]" : ""}`}>
            <div className="max-w-[1600px] mx-auto flex flex-col gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 h-[calc(100vh-80px)]">
                
                <PageHeader 
                    icon="fa-solid fa-sitemap" 
                    title="Website CMS Hub" 
                    subtitle="Manage public-facing pages, blogs, and career opportunities."
                    rightContent={
                        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl backdrop-blur-3xl border border-black/5 dark:border-white/10 overflow-x-auto no-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                        activeTab === tab.id 
                                        ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-themeAccent' 
                                        : 'text-themeTextSec hover:text-themeText hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                                </button>
                            ))}
                        </div>
                    }
                />

                <div className="flex-1 min-h-0 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden flex flex-col relative z-10">
                    {activeTab === "editor" && <div className="h-full w-full overflow-y-auto"><AdminSiteEditor isEmbedded={true} /></div>}
                    {activeTab === "blogs" && <div className="h-full w-full overflow-y-auto"><BlogManager isEmbedded={true} /></div>}
                    {activeTab === "careers" && <div className="h-full w-full overflow-y-auto"><AdminPlacements isEmbedded={true} /></div>}
                </div>

            </div>
        </div>
    );
}
