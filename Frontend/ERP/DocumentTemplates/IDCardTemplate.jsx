/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import pclLogo from '../../Shared/Assets/LOGOS/pcl_logo.svg';

/**
 * IDCardTemplate
 * Ultra-premium, Apple-inspired print-ready PVC ID Card Template.
 */
const IDCardTemplate = React.forwardRef(({ profileData, roleTitle, userSession }, ref) => {
    
    const getThemeColor = () => {
        if (roleTitle === 'Faculty' || roleTitle === 'Admin') return { main: '#007AFF', light: 'rgba(0,122,255,0.1)', grad: 'from-blue-500' };
        
        const prog = (profileData?.programme || profileData?.department || '').toLowerCase().replace(/[\.\s]/g, '');
        
        if (prog.includes('bballb') || prog.includes('bba')) return { main: '#F59E0B', light: 'rgba(245,158,11,0.1)', grad: 'from-amber-400' };
        if (prog.includes('ballb') || prog.includes('ba')) return { main: '#34C759', light: 'rgba(52,199,89,0.1)', grad: 'from-green-400' };
        if (prog.includes('llm') || prog.includes('masters')) return { main: '#AF52DE', light: 'rgba(175,82,222,0.1)', grad: 'from-purple-500' };
        if (prog.includes('llb')) return { main: '#FF3B30', light: 'rgba(255,59,48,0.1)', grad: 'from-red-500' };
        
        return { main: '#1C1C1E', light: 'rgba(28,28,30,0.1)', grad: 'from-gray-800' }; // Default
    };

    const theme = getThemeColor();

    return (
        <div ref={ref} className="w-[340px] h-[540px] bg-[#ffffff] rounded-[24px] overflow-hidden relative flex flex-col shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] font-sans border border-black/[0.04]" style={{ contain: 'paint' }}>
            
            {/* Ambient Background Mesh */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-white to-gray-50"></div>
            <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-gradient-to-br ${theme.grad} to-transparent opacity-[0.08] rounded-full blur-[60px] pointer-events-none`}></div>
            <div className={`absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] bg-gradient-to-tl ${theme.grad} to-transparent opacity-[0.06] rounded-full blur-[50px] pointer-events-none`}></div>
            
            {/* Guilloche / Watermark */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none mix-blend-multiply" 
                 style={{ backgroundImage: `url(${pclLogo})`, backgroundSize: '180px', backgroundRepeat: 'space', backgroundPosition: 'center' }}>
            </div>

            {/* Header Area */}
            <div className="relative z-10 w-full pt-6 pb-20 px-6 flex flex-col items-center justify-center bg-gradient-to-b from-black/[0.03] to-transparent border-b border-black/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-black/[0.05] flex items-center justify-center p-1.5">
                        <img src={pclLogo} alt="PCL Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-black font-black text-[14px] tracking-[0.1em] uppercase leading-none">
                            Prudentia College
                        </h3>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: theme.main }}>Of Law</span>
                    </div>
                </div>
            </div>

            {/* Profile Photo - Floating Apple Wallet Style */}
            <div className="relative z-20 flex justify-center -mt-16 mb-4">
                <div className="relative">
                    {/* Glow behind photo */}
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 translate-y-2" style={{ backgroundColor: theme.main }}></div>
                    
                    <div className="w-32 h-32 bg-white rounded-[1.25rem] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-[3px] border-white overflow-hidden flex items-center justify-center relative z-20">
                        {profileData?.profile_picture_url ? (
                            <img src={profileData.profile_picture_url} alt="ID" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                <i className="fa-solid fa-user text-4xl text-gray-300"></i>
                            </div>
                        )}
                    </div>
                    
                    {/* Role Badge Overlapping Photo */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full shadow-md border border-white/20 backdrop-blur-md flex items-center justify-center" style={{ backgroundColor: theme.main }}>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap drop-shadow-sm">
                            {roleTitle || 'STUDENT'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 px-6 flex flex-col items-center relative z-10 text-center mt-2">
                <h4 className="text-[22px] font-black text-black tracking-tight leading-none mb-1.5">
                    {profileData?.full_name || 'STUDENT NAME'}
                </h4>
                
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-6 max-w-full truncate px-2">
                    {profileData?.programme || profileData?.department || (userSession?.role === 'student' ? "B.B.A. LL.B. (Hons.)" : "Department")}
                </p>

                {/* Info Grid */}
                <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 relative overflow-hidden">
                    {/* Accent strip left */}
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: theme.main }}></div>
                    
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">ID NO</span>
                        <span className="font-black text-black tracking-tight">{profileData?.erp_id || "PCL-00000"}</span>
                    </div>
                    <div className="w-full h-px bg-gray-50"></div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">DOB</span>
                        <span className="font-bold text-gray-800">{profileData?.dob ? new Date(profileData.dob).toLocaleDateString('en-GB') : "XX-XX-XXXX"}</span>
                    </div>
                    <div className="w-full h-px bg-gray-50"></div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">BLOOD GRP</span>
                        <span className="font-black text-[#FF3B30]">{profileData?.blood_group || "O+"}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Barcode */}
            <div className="w-full pt-4 pb-5 px-6 flex flex-col items-center justify-end relative z-10 mt-auto bg-gray-50/50">
                <div className="w-48 h-8 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e9/UPC-A-036000291452.svg')] bg-cover opacity-[0.65] mix-blend-multiply mb-3 grayscale"></div>
                <p className="text-[7px] text-gray-400 font-bold uppercase tracking-[0.15em]">Property of Prudentia College of Law</p>
            </div>
            
        </div>
    );
});

export default IDCardTemplate;
