/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { theme } from '../../../../Shared/theme';

export default function PageHeader({ isEmbedded = false,  icon, title, subtitle, rightContent }) {
    return (
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${!isEmbedded ? `${theme.layout.panel} p-4 md:p-6 lg:p-8 border-themeBorder` : ""}`}>
            {!isEmbedded && (
                <div className="flex items-center gap-5">
                    {icon && (
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeAccent/10 border border-themeAccent/20 rounded-xl flex items-center justify-center text-themeAccent text-2xl lg:text-3xl shrink-0 shadow-sm backdrop-blur-xl">
                            <i className={icon}></i>
                        </div>
                    )}
                    <div>
                        <h1 className="text-[22px] lg:text-[28px] font-bold text-themeText font-serif mb-0.5 tracking-tight leading-tight">
                            {title}
                        </h1>
                        <p className="text-themeTextSec text-[13px] lg:text-[14px] font-medium tracking-tight">
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
