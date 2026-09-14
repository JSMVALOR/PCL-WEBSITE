/* © 2026 JSM VALOR. All Rights Reserved. */
// src/theme.js

// Premium Enterprise Dynamic Theme System
export const theme = {
    layout: {
        appBase: "bg-themeApp text-themeText min-h-screen flex selection:bg-themeAccent/20 premium-bg",
        panel: "bg-themePanel/85 backdrop-blur-2xl border-theme border-white/5 rounded-themePanel shadow-premium transition duration-300", 
        panelElevated: "bg-themeElevated/90 backdrop-blur-2xl border-theme border-themeBorderStrong shadow-premiumElevated rounded-themePanel transition duration-300", 
        divider: "border-themeBorder", 
    },

    text: {
        primary: "text-themeText", 
        secondary: "text-themeTextSec", 
        muted: "text-themeTextSec opacity-70 tracking-normal", 
        accent: "text-themeAccent",
        heading: "font-serif font-semibold tracking-tight text-themeAccent",
        overline: "text-[10px] font-bold uppercase tracking-widest text-themeTextSec", 
    },

    action: {
        rowBase: "w-full flex items-center gap-3 px-4 py-3 rounded-themeBtn text-xs font-medium transition duration-300 active:scale-[0.98]",
        rowActive: "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong shadow-sm",
        rowInactive: "text-themeTextSec hover:text-themeText hover:bg-themePanel border-theme border-transparent",

        btnPrimary: "bg-themeAccent text-black font-bold px-6 py-3 rounded-themeBtn hover:bg-themeAccentMuted transition duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-themeAccent/20 hover:shadow-themeAccent/40",
        btnSecondary: "bg-themePanel/80 backdrop-blur-md text-themeText border-theme border-themeBorder hover:border-themeBorderStrong px-6 py-3 rounded-themeBtn transition duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-sm hover:shadow-md",
        btnDanger: "bg-[#1a0f0f]/80 backdrop-blur-md text-rose-500 border-theme border-rose-500/20 hover:border-rose-500 hover:bg-rose-950 px-6 py-3 rounded-themeBtn transition duration-300 flex items-center justify-center gap-2 active:scale-95",
        
        iconBtn: "w-9 h-9 rounded-themeBtn hover:bg-themePanel flex items-center justify-center text-themeTextSec hover:text-themeAccent transition duration-300 border-theme border-transparent hover:border-themeBorder active:scale-90",
    },

    inputs: {
        base: "w-full bg-themeElevated/90 border border-themeBorder text-themeText focus:border-themeAccent focus:outline-none transition-colors placeholder:text-themeTextSec/50",
        elevated: "shadow-sm hover:shadow-md"
    },
    ui: {
        avatar: "rounded-themeBtn bg-themePanel/80 backdrop-blur-md border-theme border-themeBorder flex items-center justify-center font-bold text-themeAccent font-serif shadow-sm",
        card: "bg-themePanel/85 backdrop-blur-2xl border-theme border-white/5 rounded-themePanel px-6 py-8 md:px-8 md:py-10 shadow-premium transition duration-500 hover:shadow-premiumElevated",
        logoBox: "w-10 h-10 bg-themeApp/80 backdrop-blur-md border-theme border-themeBorderStrong rounded-themeBtn flex items-center justify-center text-themeAccent shadow-premiumElevated",
    }
};
