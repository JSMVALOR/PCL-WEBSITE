/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { forwardRef } from 'react';
import pclLogo from '../../Shared/Assets/LOGOS/pcl_logo.svg';

const LuxuryPayslipTemplate = forwardRef(({ faculty, payload }, ref) => {
    if (!faculty || !payload) return <div ref={ref}></div>;

    // A4 Portrait dimensions for HTML to PDF (approx 794x1123 for 96 DPI, rendering at 2x scale for crispness)
    return (
        <div 
            ref={ref} 
            className="bg-[#F6F4F0] text-[#1e1e1c] font-serif relative"
            style={{ width: '210mm', minHeight: '297mm', padding: '0', boxSizing: 'border-box' }}
        >
            {/* TOP HEADER SECTION */}
            <div className="bg-[#1C1C1E] text-white px-12 py-8 flex justify-between items-center relative overflow-hidden">
                
                <div className="flex items-center gap-6 relative z-10">
                    <img src={pclLogo} alt="PCL" className="w-20 h-20 object-contain" />
                    <div>
                        <h1 className="text-3xl font-serif font-black tracking-widest text-[#F2F2F7]">PRUDENTIA</h1>
                        <h2 className="text-[10px] font-sans font-bold tracking-[0.3em] text-[#b59c72] uppercase mt-1">College of Law</h2>
                        <div className="h-px w-full bg-[#e9e1d4] my-2"></div>
                        <p className="text-[8px] font-sans tracking-[0.2em] text-[#8E8E93]">TRUTH • JUSTICE • EXCELLENCE</p>
                    </div>
                </div>

                <div className="text-right relative z-10">
                    <h1 className="text-4xl font-serif text-[#b59c72] mb-1">Payslip</h1>
                    <p className="text-sm font-sans tracking-widest text-[#d4d4da] uppercase">{payload.month} {payload.year}</p>
                </div>
            </div>
            
            <div className="h-2 w-full bg-[#b59c72]"></div>

            <div className="p-12">
                {/* TOP DETAILS ROW */}
                <div className="grid grid-cols-3 gap-8 mb-8">
                    {/* Employee Details */}
                    <div className="col-span-2 space-y-2">
                        <h3 className="text-lg font-bold text-[#1C1C1E] border-b border-[#e9e1d4] pb-2 mb-4">Employee Details</h3>
                        <div className="grid grid-cols-3 text-xs gap-y-2">
                            <div className="font-bold text-[#5a5a5c]">Name</div>
                            <div className="col-span-2 font-medium">: {faculty.full_name}</div>
                            
                            <div className="font-bold text-[#5a5a5c]">Employee ID</div>
                            <div className="col-span-2 font-medium">: {faculty.erp_id}</div>
                            
                            <div className="font-bold text-[#5a5a5c]">Department</div>
                            <div className="col-span-2 font-medium">: Law & Academics</div>
                            
                            <div className="font-bold text-[#5a5a5c]">Bank Account</div>
                            <div className="col-span-2 font-medium">: {payload.transaction_id || "N/A"}</div>
                        </div>
                    </div>
                    
                    {/* Month Details & Quote */}
                    <div className="space-y-4">
                        <div className="bg-[#ffffff] p-4 border border-[#f0ebe1] rounded text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-[#5a5a5c]"><i className="fa-solid fa-calendar-day mr-2 text-[#b59c72]"></i>Pay Period</span>
                                <span className="font-medium">{payload.month} {payload.year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#5a5a5c]"><i className="fa-solid fa-money-check-dollar mr-2 text-[#b59c72]"></i>Pay Date</span>
                                <span className="font-medium">{payload.payment_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-[#5a5a5c]"><i className="fa-solid fa-user-xmark mr-2 text-[#b59c72]"></i>LOP Days</span>
                                <span className="font-medium text-[#e11d48]">{payload.lop_days || "0"}</span>
                            </div>
                            {payload.lop_waived_days > 0 && (
                                <div className="flex justify-between">
                                    <span className="font-bold text-[#5a5a5c]"><i className="fa-solid fa-hand-holding-heart mr-2 text-[#059669]"></i>Waived</span>
                                    <span className="font-medium text-[#059669]">{payload.lop_waived_days} Days</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-[#EBE5D9] p-5 rounded border border-[#e9e1d4] text-center">
                            <p className="font-serif italic text-sm text-[#1C1C1E] leading-relaxed">"Empowering minds, strengthening society."</p>
                            <p className="text-[7px] font-sans font-bold uppercase tracking-widest text-[#b59c72] mt-3">Prudentia College of Law</p>
                        </div>
                    </div>
                </div>

                {/* EARNINGS & DEDUCTIONS TABLES */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* EARNINGS */}
                    <div>
                        <div className="bg-[#1C1C1E] text-white p-3 rounded-t flex items-center gap-3">
                            <i className="fa-solid fa-coins text-[#b59c72]"></i>
                            <h3 className="font-serif text-sm">Earnings</h3>
                        </div>
                        <table className="w-full text-xs border border-[#e8e8e8] bg-white">
                            <thead className="bg-[#F6F4F0] border-b border-[#e8e8e8]">
                                <tr>
                                    <th className="text-left p-3 font-bold text-[#5a5a5c]">Component</th>
                                    <th className="text-right p-3 font-bold text-[#5a5a5c]">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(payload.salary_structure || [
                                    { name: "Basic Pay", percentage: 50 },
                                    { name: "HRA", percentage: 30 },
                                    { name: "Special Allowance", percentage: 20 }
                                ]).map((comp, idx) => (
                                    <tr key={idx} className="border-b border-[#f3f4f6]">
                                        <td className="p-3">{comp.name}</td>
                                        <td className="p-3 text-right font-medium">{Number(payload.base_pay * (comp.percentage / 100)).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-[#F6F4F0] font-bold border-t border-[#d1d1d1]">
                                    <td className="p-3">Total Earnings (A)</td>
                                    <td className="p-3 text-right text-[#059669]">{Number(payload.base_pay).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* DEDUCTIONS */}
                    <div>
                        <div className="bg-[#1C1C1E] text-white p-3 rounded-t flex items-center gap-3">
                            <i className="fa-solid fa-hand-holding-dollar text-[#b59c72]"></i>
                            <h3 className="font-serif text-sm">Deductions</h3>
                        </div>
                        <table className="w-full text-xs border border-[#e8e8e8] bg-white h-[calc(100%-44px)] flex flex-col">
                            <thead className="bg-[#F6F4F0] border-b border-[#e8e8e8] w-full table table-fixed">
                                <tr>
                                    <th className="text-left p-3 font-bold text-[#5a5a5c]">Component</th>
                                    <th className="text-right p-3 font-bold text-[#5a5a5c]">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="w-full flex-1 table table-fixed">
                                <tr className="border-b border-[#f3f4f6]">
                                    <td className="p-3">Professional Tax (PT)</td>
                                    <td className="p-3 text-right font-medium">{Number(payload.professional_tax).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b border-[#f3f4f6]">
                                    <td className="p-3">Income Tax (TDS 192)</td>
                                    <td className="p-3 text-right font-medium">{Number(payload.tds_amount).toFixed(2)}</td>
                                </tr>
                                <tr className="border-b border-[#f3f4f6] text-[#e74a6c]">
                                    <td className="p-3">Leave Without Pay (LOP)</td>
                                    <td className="p-3 text-right font-medium">{Number(payload.gross_lop_amount || payload.deductions).toFixed(2)}</td>
                                </tr>
                                {payload.lop_waived_days > 0 && (
                                    <tr className="border-b border-[#f3f4f6] text-[#059669] bg-[#f5fef9]">
                                        <td className="p-3 italic">LOP Waiver ({payload.lop_waiver_reason})</td>
                                        <td className="p-3 text-right font-medium">- {Number(payload.lop_waived_amount).toFixed(2)}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="w-full table table-fixed mt-auto">
                                <tr className="bg-[#F6F4F0] font-bold border-t border-[#d1d1d1]">
                                    <td className="p-3">Total Deductions (B)</td>
                                    <td className="p-3 text-right text-[#e11d48]">{Number(payload.professional_tax + payload.tds_amount + payload.deductions).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* NET PAY BAR */}
                <div className="bg-[#1C1C1E] text-white rounded-lg flex items-center justify-between p-6 mb-8 border border-[#e9e1d4]  relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[#b59c72]"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-[#f0ebe1] flex items-center justify-center border border-[#dacdae]">
                            <i className="fa-solid fa-wallet text-xl text-[#b59c72]"></i>
                        </div>
                        <div>
                            <h3 className="font-serif text-xl mb-1">Net Pay (A - B)</h3>
                            <p className="text-[10px] font-sans tracking-widest uppercase text-[#a3a3a3]">Disbursed via {payload.payment_mode}</p>
                        </div>
                    </div>
                    <div className="relative z-10 border-l border-[#e9e1d4] pl-8">
                        <h2 className="text-4xl font-serif text-[#b59c72]">₹ {Number(payload.final_net_pay).toLocaleString('en-IN', {minimumFractionDigits: 2})}</h2>
                    </div>
                </div>

                {/* FOOTER NOTES & SIGNATURE */}
                <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-[#e9e1d4]">
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#1C1C1E] mb-4">
                            <i className="fa-solid fa-circle-info text-[#b59c72]"></i> Notes
                        </h4>
                        <ol className="list-decimal list-inside text-[10px] text-[#5a5a5c] space-y-2 font-sans leading-relaxed">
                            <li>This is a system generated payslip securely processed by PCL ERP.</li>
                            <li>Income Tax has been deducted as per the applicable provisions of the Income Tax Act, 1961 (Section 192).</li>
                            <li>For any discrepancies, please contact the PCL Finance Department within 7 days.</li>
                            <li>This document is strictly confidential and encrypted specifically for the employee.</li>
                        </ol>
                    </div>
                    <div className="text-right flex flex-col justify-end items-end">
                        <p className="text-xs text-[#5a5a5c] font-sans mb-4">With best regards,</p>
                        <div className="h-12 w-32 border-b border-[#d1d1d1] mb-2 relative">
                            {/* Stylized Signature */}
                            <span className="font-signature text-3xl absolute bottom-1 right-2 text-[#1C1C1E] opacity-80" style={{ fontFamily: "'Brush Script MT', cursive" }}>System Admin</span>
                        </div>
                        <p className="text-xs font-bold text-[#1C1C1E]">Registrar (Finance)</p>
                        <p className="text-[10px] text-[#5a5a5c] font-sans mt-1">Prudentia College of Law</p>
                    </div>
                </div>
            </div>

            {/* ABSOLUTE FOOTER */}
            <div className="absolute bottom-0 w-full bg-[#1C1C1E] text-[#a3a3a3] text-[9px] font-sans tracking-widest uppercase py-4 px-12 flex justify-between items-center border-t border-[#dacdae]">
                <div className="flex gap-6">
                    <span><i className="fa-solid fa-location-dot mr-2 text-[#b59c72]"></i> Hyderabad, Telangana</span>
                    <span><i className="fa-solid fa-envelope mr-2 text-[#b59c72]"></i> accounts@prudentia.edu.in</span>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-[#b59c72]">TRUTH</span> |
                    <span className="text-[#b59c72]">JUSTICE</span> |
                    <span className="text-[#b59c72]">EXCELLENCE</span>
                </div>
            </div>
        </div>
    );
});

export default LuxuryPayslipTemplate;
