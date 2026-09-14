import React from 'react';

export default function PageHeader({ icon, title, subtitle, rightContent, isEmbedded = false }) {
    return (
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${!isEmbedded ? "bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] p-4 md:p-6 lg:p-8 rounded-2xl" : ""}`}>
            {!isEmbedded && (
                <div className="flex items-center gap-5">
                    {icon && (
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#007AFF]/10 to-[#5AC8FA]/10 border border-[#007AFF]/20 rounded-xl flex items-center justify-center text-[#007AFF] text-2xl lg:text-3xl shrink-0 shadow-sm backdrop-blur-xl">
                            <i className={icon}></i>
                        </div>
                    )}
                    <div>
                        <h1 className="text-[22px] lg:text-[28px] font-bold text-[#1C1C1E] dark:text-[#F2F2F7] mb-0.5 tracking-tight leading-tight">
                            {title}
                        </h1>
                        <p className="text-[#8E8E93] text-[13px] lg:text-[14px] font-medium tracking-tight">
                            {subtitle}
                        </p>
                    </div>
                </div>
            )}
            
            {rightContent && (
                <div className="w-full md:w-auto">
                    {rightContent}
                </div>
            )}
        </div>
    );
}
