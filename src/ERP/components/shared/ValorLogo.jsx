/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

export default function ValorLogo({ className = "" }) {
    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            {/* Signature part */}
            <span 
                className="text-red-500 transform -rotate-12 translate-y-1" 
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: "1.5em", lineHeight: 1 }}
            >
                Jsm
            </span>
            
            {/* VALOR Text part */}
            <div className="relative flex flex-col justify-end">
                <div className="flex items-baseline leading-none" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
                    <span className="text-white tracking-tight" style={{ fontSize: "1.4em" }}>VALOR</span>
                    <span className="text-red-500" style={{ fontSize: "1.4em" }}>.</span>
                </div>
                {/* Blue underline */}
                <div className="h-1 bg-blue-600 w-full mt-0.5"></div>
            </div>
        </div>
    );
}
