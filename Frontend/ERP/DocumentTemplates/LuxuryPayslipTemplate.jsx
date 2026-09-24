/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import pclLogo from '../../Shared/Assets/LOGOS/pcl_logo.svg';

const numberToWordsIndian = (num) => {
    if (!num) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
    return str;
};

const LuxuryPayslipTemplate = React.forwardRef(({ payload, profileData }, ref) => {
    if (!payload || !profileData) return null;

    const amount = Number(payload.amount) || 0;

    return (
        <div ref={ref} className="w-[850px] min-h-[1100px] bg-[#fdfcf9] relative overflow-hidden font-serif text-[#2b2b2b] shadow-2xl p-16 border-[12px] border-[#1c1c1c]" style={{ contain: 'paint' }}>
            {/* Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[650px] h-[650px]">
                <img src={pclLogo} alt="PCL Watermark" className="w-full h-full object-contain filter grayscale" />
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-start mb-16 relative z-10">
                <div className="flex items-center gap-6">
                    <img src={pclLogo} alt="PCL Logo" className="w-24 h-24 object-contain" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' }} />
                    <div className="border-l border-[#d1c8b8] pl-6 py-2">
                        <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-[#1c1c1c] leading-tight mb-2">Prudentia College <br/>of Law</h1>
                        <p className="text-[9px] font-sans font-bold tracking-[0.2em] text-[#8a8a70] uppercase">Official Remittance Document</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-[#8a8a70] mb-3">Payslip Statement</h2>
                    <div className="bg-[#1c1c1c] text-[#e9e1d4] px-6 py-3 rounded shadow-md inline-block">
                        <p className="text-xl font-bold tracking-widest uppercase">{payload.month} {payload.year}</p>
                    </div>
                </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
                {/* Employee Info */}
                <div className="border border-[#e9e1d4] rounded-lg p-8 bg-white/60 backdrop-blur-sm shadow-sm">
                    <h3 className="text-[9px] font-sans font-black tracking-[0.3em] uppercase text-[#1c1c1c] mb-6 border-b border-[#e9e1d4] pb-3">Faculty Details</h3>
                    <div className="space-y-4 font-sans text-xs">
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Name</span>
                            <span className="font-bold text-[#1c1c1c]">{profileData.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Faculty ID</span>
                            <span className="font-bold text-[#1c1c1c]">{profileData.erp_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Designation</span>
                            <span className="font-medium text-[#1c1c1c]">{payload.designation}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Department</span>
                            <span className="font-medium text-[#1c1c1c]">{profileData.department}</span>
                        </div>
                    </div>
                </div>

                {/* Transfer Info */}
                <div className="border border-[#e9e1d4] rounded-lg p-8 bg-white/60 backdrop-blur-sm shadow-sm">
                    <h3 className="text-[9px] font-sans font-black tracking-[0.3em] uppercase text-[#1c1c1c] mb-6 border-b border-[#e9e1d4] pb-3">Remittance Details</h3>
                    <div className="space-y-4 font-sans text-xs">
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Txn Ref</span>
                            <span className="font-mono font-bold text-[#1c1c1c]">{payload.transaction_id || 'PENDING'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Date</span>
                            <span className="font-bold text-[#1c1c1c]">{new Date(payload.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Bank A/C</span>
                            <span className="font-mono text-[#1c1c1c]">{payload.bank_account}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#8a8a70] font-bold uppercase tracking-wider">Mode</span>
                            <span className="font-bold text-[#1c1c1c]">{payload.payment_mode}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NET PAY DISPLAY */}
            <div className="bg-[#1c1c1c] text-white rounded-xl p-12 mb-12 relative overflow-hidden text-center shadow-2xl border border-[#333]">
                {/* Embedded watermark in the dark box */}
                <div className="absolute -left-12 -bottom-16 w-64 h-64 opacity-5 pointer-events-none">
                    <img src={pclLogo} alt="" className="w-full h-full object-contain filter invert" />
                </div>
                
                <p className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase text-[#a3a3a3] relative z-10 mb-4">Net Disbursed Amount</p>
                <h2 className="text-6xl font-serif text-[#d4af37] relative z-10 mb-6 drop-shadow-lg">
                    &#8377; {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <div className="w-24 h-[2px] bg-[#d4af37]/30 mx-auto my-6 relative z-10"></div>
                <p className="text-xs font-sans italic text-[#e9e1d4] relative z-10 tracking-wide font-medium">
                    {numberToWordsIndian(amount)}
                </p>
            </div>

            {/* QUOTE */}
            <div className="bg-[#f0ece1] py-6 px-10 rounded border-l-4 border-[#d4af37] text-center mb-16 shadow-inner">
                <p className="font-serif italic text-base text-[#1c1c1c] leading-relaxed">
                    &ldquo;Excellence in Legal Education, Integrity in Profession.&rdquo;
                </p>
            </div>

            {/* FOOTER & SIGS */}
            <div className="absolute bottom-20 left-16 right-16">
                <div className="grid grid-cols-2 gap-12 pt-8 border-t border-[#d1c8b8]">
                    <div>
                        <h4 className="text-[9px] font-sans font-black text-[#1c1c1c] mb-3 uppercase tracking-widest">Confidentiality Note</h4>
                        <p className="text-[9px] text-[#5a5a5c] font-sans leading-relaxed text-justify pr-8">
                            This document is strictly confidential and generated by the PCL Automated Payroll System. 
                            It serves as official proof of remittance for the stated period. Discrepancies, if any, 
                            should be reported to the Finance Department within 7 working days.
                        </p>
                    </div>
                    <div className="text-right flex flex-col justify-end items-end">
                        <div className="h-16 w-48 border-b border-[#1c1c1c] mb-3 relative flex items-end justify-end pb-2">
                            <span className="text-4xl absolute bottom-1 right-2 text-[#1c1c1c] opacity-90" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                                PCL Finance
                            </span>
                        </div>
                        <p className="text-[10px] font-sans font-black uppercase tracking-widest text-[#1c1c1c]">Registrar (Finance)</p>
                        <p className="text-[9px] text-[#8a8a70] font-sans font-bold uppercase tracking-wider mt-1">Prudentia College of Law</p>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#1c1c1c] via-[#d4af37] to-[#1c1c1c]"></div>
        </div>
    );
});

export default LuxuryPayslipTemplate;
