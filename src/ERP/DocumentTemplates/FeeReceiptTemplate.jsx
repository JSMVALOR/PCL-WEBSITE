/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';

/**
 * FeeReceiptTemplate
 * This component contains the HTML/CSS markup for the official University Fee Receipt.
 * It is structured to be screenshotted by html2canvas (via pdfEngine).
 * To edit the receipt layout, change the HTML/Tailwind classes below.
 */
export const FeeReceiptTemplate = React.forwardRef(({ invoiceData, studentData }, ref) => {
    if (!invoiceData) return null;
    
    return (
        <div ref={ref} className="w-[800px] bg-white p-12 text-black shadow-none absolute top-[-9999px] left-[-9999px]">
            {/* Header section */}
            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#8b0000] uppercase">Prudentia College of Law</h1>
                    <p className="text-sm font-bold text-themeTextSec tracking-widest mt-1">OFFICIAL FEE RECEIPT</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-themeText">Date: {new Date().toLocaleDateString('en-GB')}</p>
                    <p className="text-sm font-bold text-themeText">Receipt No: RCPT-{invoiceData.id.split('-')[0].toUpperCase()}</p>
                </div>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-lg border border-themeBorder">
                <div>
                    <p className="text-xs font-bold text-themeTextSec uppercase tracking-wider mb-1">Student Name</p>
                    <p className="text-lg font-black text-themeText">{studentData?.full_name || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-themeTextSec uppercase tracking-wider mb-1">ERP ID</p>
                    <p className="text-lg font-black text-themeText">{studentData?.erp_id || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-themeTextSec uppercase tracking-wider mb-1">Program</p>
                    <p className="text-lg font-black text-themeText">B.B.A. LL.B. (Hons.)</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-themeTextSec uppercase tracking-wider mb-1">Academic Year</p>
                    <p className="text-lg font-black text-themeText">2026-2027</p>
                </div>
            </div>

            {/* Payment Details */}
            <h3 className="text-lg font-black uppercase text-themeText mb-4 border-b border-themeBorder pb-2">Payment Description</h3>
            <table className="w-full mb-8 text-sm">
                <thead>
                    <tr className="bg-gray-100 border-b border-themeBorder">
                        <th className="text-left py-3 px-4 font-bold text-themeTextSec">Description</th>
                        <th className="text-right py-3 px-4 font-bold text-themeTextSec">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100">
                        <td className="py-4 px-4 font-medium text-themeText">{invoiceData.description || 'Tuition Fee'}</td>
                        <td className="text-right py-4 px-4 font-black text-themeText">₹{Number(invoiceData.amount).toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-themeBorder">
                        <td className="py-4 px-4 font-black text-right text-themeText">TOTAL AMOUNT PAID</td>
                        <td className="text-right py-4 px-4 font-black text-[#8b0000] text-xl">₹{Number(invoiceData.amount).toLocaleString('en-IN')}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Transaction Info */}
            <div className="flex flex-col gap-1 mb-16 text-sm">
                <p><span className="font-bold text-themeTextSec">Payment Status:</span> <span className="font-black text-emerald-600 uppercase">Successful</span></p>
                <p><span className="font-bold text-themeTextSec">Transaction ID:</span> <span className="font-mono font-bold text-themeText">{invoiceData.id}</span></p>
                <p><span className="font-bold text-themeTextSec">Payment Method:</span> <span className="font-bold text-themeText">{invoiceData.mode || 'Online Portal'}</span></p>
            </div>

            {/* Footer / Signature */}
            <div className="flex justify-between items-end border-t-2 border-themeBorder pt-8 mt-12">
                <div className="text-xs font-bold text-themeTextSec max-w-sm">
                    <p>This is a computer-generated receipt and does not require a physical signature.</p>
                </div>
                <div className="text-center">
                    <div className="w-48 border-b border-black mb-2"></div>
                    <p className="font-bold text-themeText text-sm">Authorized Signatory</p>
                    <p className="font-bold text-themeTextSec text-xs">Accounts Department</p>
                </div>
            </div>
        </div>
    );
});

export default FeeReceiptTemplate;
