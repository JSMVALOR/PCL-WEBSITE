/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

/**
 * IDCardTemplate
 * This component contains the HTML/CSS markup for the official University ID Card.
 * It is structured to be screenshotted by html2canvas (via pdfEngine).
 * To edit the ID card design, change the HTML/Tailwind classes below.
 */
export const IDCardTemplate = React.forwardRef(({ profileData, roleTitle, userSession }, ref) => {
    return (
        <div ref={ref} className="w-[340px] bg-white border-2 border-black/10 rounded-2xl overflow-hidden relative flex flex-col shadow-2xl">
            {/* ID Card Header */}
            <div className="bg-[#8b0000] p-4 text-center border-b-4 border-amber-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <h3 className="relative z-10 text-white font-black text-sm tracking-widest uppercase">Prudentia College of Law</h3>
            </div>

            {/* ID Card Body */}
            <div className="p-6 flex flex-col items-center bg-black/5 dark:bg-white/10 backdrop-blur-[80px] border border-black/10 dark:border-white/20">
                <div className="w-24 h-24 bg-neutral-200 border-2 border-neutral-300 rounded overflow-hidden mb-4 flex items-center justify-center">
                    {profileData?.profile_picture_url ? (
                        <img src={profileData.profile_picture_url} alt="ID" className="w-full h-full object-cover" />
                    ) : (
                        <i className="fa-solid fa-user text-4xl text-neutral-400"></i>
                    )}
                </div>
                
                <h4 className="text-xl font-black text-neutral-900 tracking-tight text-center leading-tight mb-1">{profileData?.full_name || 'Student Name'}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">{profileData?.department || (userSession?.role === 'student' ? "B.B.A. LL.B. (Hons.)" : "Department")}</p>

                <div className="w-full flex flex-col gap-2 border-t border-neutral-200 pt-4">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-500 uppercase">{roleTitle} ID</span>
                        <span className="font-black text-neutral-900">{profileData?.erp_id || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-500 uppercase">DOB</span>
                        <span className="font-black text-neutral-900">{profileData?.dob ? new Date(profileData.dob).toLocaleDateString('en-GB') : "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-500 uppercase">Blood Group</span>
                        <span className="font-black text-rose-600">{profileData?.blood_group || "N/A"}</span>
                    </div>
                </div>

                {/* Barcode / QR Code Placeholder */}
                <div className="mt-6 pt-4 border-t border-neutral-200 w-full flex flex-col items-center">
                    <div className="w-48 h-8 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e9/UPC-A-036000291452.svg')] bg-cover opacity-60 mix-blend-multiply mb-1"></div>
                </div>
            </div>
        </div>
    );
});

export default IDCardTemplate;
