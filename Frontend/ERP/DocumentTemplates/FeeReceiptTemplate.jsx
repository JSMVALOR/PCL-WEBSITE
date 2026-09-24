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

const FeeReceiptTemplate = React.forwardRef(({ invoiceData, studentData }, ref) => {
    if (!invoiceData) return null;

    const amount = Number(invoiceData.amount) || 0;
    const isPaid = invoiceData.status === 'paid' || invoiceData.status === 'successful';

    return (
        <div ref={ref} className="w-[850px] min-h-[1100px] bg-white relative overflow-hidden font-sans text-neutral-900 shadow-2xl p-16 border-[16px] border-black" style={{ contain: 'paint' }}>
            {/* Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-[600px] h-[600px]">
                <img src={pclLogo} alt="PCL Watermark" className="w-full h-full object-contain filter grayscale" />
            </div>

            {/* Stamp if paid */}
            {isPaid && (
                <div className="absolute top-32 right-32 rotate-12 border-4 border-green-600 text-green-600 p-3 rounded-lg opacity-80 pointer-events-none z-10 flex flex-col items-center justify-center mix-blend-multiply">
                    <span className="text-3xl font-black uppercase tracking-widest leading-none">PAID</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">PCL Finance Hub</span>
                </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between items-start mb-16 relative z-10 border-b-2 border-neutral-100 pb-8">
                <div className="flex items-center gap-6">
                    <img src={pclLogo} alt="PCL Logo" className="w-24 h-24 object-contain drop-shadow-xl" />
                    <div>
                        <h1 className="text-3xl font-black text-black tracking-tight uppercase leading-none mb-2">Prudentia College</h1>
                        <h2 className="text-xl font-bold text-neutral-500 tracking-widest uppercase mb-1">of Law, Hyderabad</h2>
                        <p className="text-xs font-semibold text-neutral-400">Recognized by the Bar Council of India (BCI)</p>
                    </div>
                </div>
                <div className="text-right flex flex-col justify-between h-full">
                    <div className="bg-black text-white px-4 py-2 mb-4 inline-block">
                        <h3 className="text-xl font-black uppercase tracking-widest">Tax Invoice</h3>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Invoice Ref</p>
                        <p className="text-lg font-black text-black">INV-{invoiceData.id}</p>
                    </div>
                </div>
            </div>

            {/* ENTITY INFO */}
            <div className="grid grid-cols-2 gap-12 mb-16 relative z-10">
                <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-200 pb-2">Billed To</h4>
                    <p className="text-xl font-black text-black mb-1">{studentData?.full_name}</p>
                    <p className="text-sm font-bold text-neutral-600 mb-2">{studentData?.erp_id}</p>
                    <p className="text-xs text-neutral-500 mb-1 font-medium">{studentData?.department || 'B.B.A. LL.B. (Hons.)'}</p>
                    <p className="text-xs text-neutral-500 font-medium">Batch: {studentData?.academic_batch || 'N/A'}</p>
                </div>
                
                <div className="flex flex-col justify-center gap-6 pl-8 border-l-2 border-neutral-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Date of Issue</p>
                        <p className="text-sm font-bold text-black">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Payment Status</p>
                        <p className={`text-sm font-black uppercase tracking-widest ${isPaid ? 'text-green-600' : 'text-rose-600'}`}>
                            {invoiceData.status}
                        </p>
                    </div>
                </div>
            </div>

            {/* LINE ITEMS */}
            <div className="mb-16 relative z-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-4 text-xs font-black uppercase tracking-widest text-neutral-400">Description</th>
                            <th className="py-4 text-xs font-black uppercase tracking-widest text-neutral-400 text-right">Amount (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-neutral-200">
                            <td className="py-6">
                                <p className="font-bold text-black text-lg">{invoiceData.title || 'Academic Fee'}</p>
                                <p className="text-xs font-medium text-neutral-500 mt-1">ERP Transaction ID: {invoiceData.id}</p>
                            </td>
                            <td className="py-6 text-right font-black text-xl text-black">
                                &#8377; {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* TOTALS */}
            <div className="flex justify-end mb-16 relative z-10">
                <div className="w-1/2 bg-black text-white p-8 rounded-xl shadow-2xl">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Total Payable</span>
                        <span className="text-4xl font-black">&#8377; {amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-px bg-white/20 my-4"></div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/60 text-right leading-relaxed">
                        {numberToWordsIndian(amount)}
                    </p>
                </div>
            </div>

            {/* FOOTER & TERMS */}
            <div className="absolute bottom-16 left-16 right-16">
                <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-neutral-200">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Terms & Conditions</h4>
                        <ol className="list-decimal list-inside text-[9px] text-neutral-500 space-y-2 font-medium leading-relaxed">
                            <li>This is a computer-generated invoice and does not require a physical signature.</li>
                            <li>Late payments may attract a penalty as per the institution's financial guidelines.</li>
                            <li>All disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</li>
                        </ol>
                    </div>
                    <div className="text-right flex flex-col justify-end items-end">
                        <p className="text-xs text-neutral-400 font-bold mb-4 uppercase tracking-widest">Authorized Signatory</p>
                        <div className="h-12 w-48 border-b border-black mb-2 relative flex items-end justify-end">
                            <span className="text-3xl absolute bottom-1 right-2 text-black opacity-90" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                                Accounts PCL
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black mt-2">Registrar (Finance)</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FeeReceiptTemplate;
