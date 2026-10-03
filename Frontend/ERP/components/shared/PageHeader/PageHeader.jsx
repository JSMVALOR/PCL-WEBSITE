/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { theme } from '../../../../Shared/theme';

export default function PageHeader({ isEmbedded = false, icon, title, subtitle, rightContent, breadcrumbs }) {
 return (
 <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${!isEmbedded ? `${theme.layout.panel} p-4 md:p-6 lg:p-8 border-themeBorder` : ""}`}>
 {!isEmbedded && (
 <div className="flex items-center gap-5 min-w-0">
 {icon && (
 <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeAccent/10 border border-themeAccent/20 rounded-xl flex items-center justify-center text-themeAccent text-2xl lg:text-3xl shrink-0 shadow-sm backdrop-blur-xl">
 <i className={icon}></i>
 </div>
 )}
 <div className="flex flex-col justify-center min-w-0">
 {breadcrumbs && breadcrumbs.length > 0 && (
 <div className="flex items-center gap-2 mb-1.5 overflow-x-auto whitespace-nowrap hide-scrollbar">
 {breadcrumbs.map((crumb, idx) => (
 <React.Fragment key={idx}>
 {idx > 0 && <i className="fa-solid fa-chevron-right text-[9px] text-themeTextSec/50 mt-[1px]"></i>}
 {crumb.onClick ? (
 <span onClick={crumb.onClick} className="text-[11px] font-black uppercase tracking-widest text-themeTextSec hover:text-themeAccent cursor-pointer transition-colors">
 {crumb.label}
 </span>
 ) : (
 <span className="text-[11px] font-black uppercase tracking-widest text-themeAccent">
 {crumb.label}
 </span>
 )}
 </React.Fragment>
 ))}
 </div>
 )}
 <h1 className="text-[22px] lg:text-[28px] font-bold text-themeText mb-0.5 tracking-tight leading-tight truncate">
 {title}
 </h1>
 <p className="text-themeTextSec text-[13px] lg:text-[14px] font-medium tracking-tight truncate">
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
