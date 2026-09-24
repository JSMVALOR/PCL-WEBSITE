/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

export default function ValorLogo({ className = "" }) {
    return (
        <div className={`flex items-center gap-1.5 select-none ${className}`}>
            {/* JSM part */}
            <span 
                className="text-black dark:text-white font-bold tracking-widest translate-y-[2px]" 
                style={{ fontSize: "1.1em", lineHeight: 1 }}
            >
                JSM
            </span>
            
            {/* VALOR Text part */}
            <div className="relative flex flex-col justify-end">
                <div className="flex items-baseline leading-none" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
                    <span className="text-black dark:text-white tracking-tight" style={{ fontSize: "1.4em" }}>VALOR</span>
                    <span className="text-red-500" style={{ fontSize: "1.4em" }}>.</span>
                </div>
            </div>
        </div>
    );
}
