/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import pclLogo from '../../Shared/Assets/LOGOS/pcl_logo.svg';

/**
 * IDCardTemplate
 * High-fidelity, print-ready PVC ID Card Template.
 */
const IDCardTemplate = React.forwardRef(({ profileData, roleTitle, userSession }, ref) => {
    return (
        <div ref={ref} className="w-[340px] h-[540px] bg-white border border-neutral-200 rounded-[20px] overflow-hidden relative flex flex-col shadow-2xl font-sans" style={{ contain: 'paint' }}>
            
            {/* Background Pattern / Security Guilloche */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `url(${pclLogo})`, backgroundSize: '150px', backgroundRepeat: 'space', backgroundPosition: 'center' }}>
            </div>
            
            {/* Abstract Gradient Mesh (Hologram look) */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* ID Card Header */}
            <div className="bg-[#1a1a1a] p-5 pb-8 relative flex flex-col items-center justify-center">
                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
                <img src={pclLogo} alt="PCL Logo" className="w-12 h-12 object-contain filter invert mb-2" />
                <h3 className="relative z-10 text-white font-black text-[13px] tracking-[0.15em] uppercase text-center leading-tight">
                    Prudentia College <br/><span className="text-[#d4af37] text-[10px]">of Law</span>
                </h3>
            </div>

            {/* Photo Section */}
            <div className="relative flex justify-center -mt-10 mb-4 z-10">
                <div className="w-32 h-32 bg-white rounded-xl shadow-lg border-[4px] border-white overflow-hidden flex items-center justify-center relative z-20">
                    {profileData?.profile_picture_url ? (
                        <img src={profileData.profile_picture_url} alt="ID" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                            <i className="fa-solid fa-user text-5xl text-neutral-300"></i>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 px-6 flex flex-col items-center relative z-10 text-center">
                <h4 className="text-xl font-black text-black tracking-tight leading-tight mb-1">
                    {profileData?.full_name || 'STUDENT NAME'}
                </h4>
                
                <div className="bg-black text-white px-3 py-1 rounded-full mb-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">{roleTitle || 'STUDENT'}</p>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-5 max-w-full truncate px-4">
                    {profileData?.department || (userSession?.role === 'student' ? "B.B.A. LL.B. (Hons.)" : "Department")}
                </p>

                <div className="w-full flex flex-col gap-2 border-t border-dashed border-neutral-300 pt-4 px-2">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-neutral-400 uppercase tracking-widest">ID NO</span>
                        <span className="font-black text-black text-xs">{profileData?.erp_id || "PCL-00000"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-neutral-400 uppercase tracking-widest">DOB</span>
                        <span className="font-black text-black">{profileData?.dob ? new Date(profileData.dob).toLocaleDateString('en-GB') : "XX-XX-XXXX"}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-neutral-400 uppercase tracking-widest">BLOOD</span>
                        <span className="font-black text-rose-600">{profileData?.blood_group || "O+"}</span>
                    </div>
                </div>
            </div>

            {/* Barcode & Footer */}
            <div className="w-full p-4 flex flex-col items-center bg-neutral-50 border-t border-neutral-100 mt-auto relative z-10">
                <div className="w-48 h-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e9/UPC-A-036000291452.svg')] bg-cover opacity-80 mix-blend-multiply mb-2"></div>
                <p className="text-[7px] text-neutral-400 font-bold uppercase tracking-widest">Property of Prudentia College of Law</p>
            </div>
            
        </div>
    );
});

export default IDCardTemplate;
