/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { generateComponentPDF } from "../../../DocumentTemplates/pdfEngine";
import { useERP } from '../../../context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function FacultyPayroll() {
    const { userSession } = useERP();
    const facultyId = userSession?.db_id || userSession?.id;
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [accountDetails, setAccountDetails] = useState({
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });

    const payslipRef = useRef(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    const handleDownloadPayslip = async (slip) => {
        setDownloadingId(slip.id);
        setSelectedPayslip(slip);
        
        // Wait for React to render the hidden template with selected slip data
        setTimeout(async () => {
            if (payslipRef.current) {
                try {
                    await generateComponentPDF(payslipRef.current, `Payslip_${slip.month}_${slip.year}.pdf`, { format: 'a4', orientation: 'portrait' });
                } catch (e) {
                    console.error("Failed to download payslip:", e);
                }
            }
            setDownloadingId(null);
            setSelectedPayslip(null);
        }, 300);
    };

    useEffect(() => {
        let isMounted = true;
        const fetchPayroll = async () => {
            try {
                const { data } = await supabase
                    .from('faculty_payroll')
                    .select('*')
                    .eq('faculty_id', facultyId)
                    .order('payment_date', { ascending: false })
                    .catch(() => ({ data: [] }));

                if (isMounted) {
                    setPayslips(data || []);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) setLoading(false);
            }
        };

        const fetchAccount = async () => {
            // First check session storage for immediate UI rendering
            const cached = sessionStorage.getItem(`salary_acc_${facultyId}`);
            if (cached) {
                setAccountDetails(JSON.parse(cached));
            }
            
            try {
                // Try fetching from profiles JSONB column 'payment_details'
                const { data } = await supabase.from('profiles').select('*').eq('id', facultyId).maybeSingle();
                if (data && data.payment_details) {
                    setAccountDetails(data.payment_details);
                    sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(data.payment_details));
                } else if (data && data.bank_name) {
                    // Fallback to individual columns if they exist
                    const dets = { bank_name: data.bank_name, account_number: data.account_number, ifsc_code: data.ifsc_code };
                    setAccountDetails(dets);
                    sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(dets));
                }
            } catch (e) {
                // Ignore schema errors quietly
            }
        };

        if (facultyId) {
            fetchPayroll();
            fetchAccount();
        }
        return () => { isMounted = false; };
    }, [facultyId]);

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Optimistically save to session storage
            sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(accountDetails));

            // Attempt to sync to Supabase JSONB column or fallback
            await supabase.from('profiles').update({
                payment_details: accountDetails
            }).eq('id', facultyId).catch(() => {});

            // Also try individual columns in case the schema uses that
            await supabase.from('profiles').update({
                bank_name: accountDetails.bank_name,
                account_number: accountDetails.account_number,
                ifsc_code: accountDetails.ifsc_code
            }).eq('id', facultyId).catch(() => {});

            setTimeout(() => {
                setIsSaving(false);
                setShowAccountModal(false);
            }, 800);
        } catch (error) {
            setIsSaving(false);
        }
    };

    const hasAccount = accountDetails.account_number && accountDetails.bank_name;
    const lastPayslip = payslips[0];

    return (
        <div className="w-full min-h-screen bg-transparent text-gray-900 dark:text-white font-sans animate-fade-in selection:bg-amber-500/30">
            <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12 flex flex-col gap-6 lg:gap-8">
                
                <PageHeader 
                    icon="fa-solid fa-file-invoice-dollar" 
                    title="Payroll Portal" 
                    subtitle="View and download your monthly salary slips"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Last Net Pay */}
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                            <i className="fa-solid fa-wallet text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1">
                                ₹{lastPayslip ? lastPayslip.net_pay.toLocaleString('en-IN') : '0.00'}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">Last Net Pay</p>
                        </div>
                    </div>

                    {/* Total Slips */}
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between group">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                            <i className="fa-solid fa-money-check-dollar text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white mb-1">{payslips.length}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50">Total Payslips Available</p>
                        </div>
                    </div>

                    {/* Salary Account */}
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${hasAccount ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                <i className="fa-solid fa-building-columns text-xl"></i>
                            </div>
                            <button 
                                onClick={() => setShowAccountModal(true)}
                                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-300 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white transition-colors"
                            >
                                {hasAccount ? 'Update' : 'Add Account'}
                            </button>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white mb-1 truncate">
                                {hasAccount ? accountDetails.bank_name : 'Salary Account'}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 flex items-center gap-1.5">
                                {hasAccount ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active (•••{accountDetails.account_number.slice(-4)})
                                    </>
                                ) : (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Action Required
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-2">
                    <h3 className="text-base lg:text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <i className="fa-solid fa-list-check text-gray-500 dark:text-white/50"></i>
                        Payslip Ledger
                    </h3>
                    
                    {loading ? (
                        <div className="w-full py-16 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : payslips.length === 0 ? (
                        <div className="w-full py-20 lg:py-32 text-center flex flex-col items-center justify-center">
                            <i className="fa-solid fa-file-invoice text-4xl lg:text-5xl text-neutral-800 dark:text-neutral-600 mb-4 lg:mb-6"></i>
                            <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white mb-1 lg:mb-2 tracking-tight">No Payslips Found</h3>
                            <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 max-w-sm mx-auto">Your payroll records will appear here once processed by HR.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {payslips.map(slip => (
                                <div key={slip.id} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-5 lg:p-6 flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white">{slip.month} {slip.year}</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1">Paid • ₹{slip.net_pay.toLocaleString('en-IN')}</p>
                                    </div>
                                    <button onClick={() => handleDownloadPayslip(slip)} disabled={downloadingId === slip.id} className="w-10 h-10 rounded-xl bg-white/5 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                        {downloadingId === slip.id ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-download"></i>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* UPDATE ACCOUNT MODAL */}
                {showAccountModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                        <div className="bg-white dark:bg-[#121212] w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col">
                            
                            <div className="p-6 border-b border-white/[0.08] flex justify-between items-start bg-[#161616]">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1 text-gray-900 dark:text-white">Direct Deposit Setup</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-white/50 font-bold uppercase tracking-widest">Securely sync your payroll destination.</p>
                                </div>
                                <button type="button" onClick={() => setShowAccountModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white hover:bg-white/10 transition-colors shrink-0">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSaveAccount} className="p-6 flex flex-col gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">Bank Name</label>
                                    <input type="text" required value={accountDetails.bank_name} onChange={(e) => setAccountDetails({...accountDetails, bank_name: e.target.value})} placeholder="e.g. HDFC Bank" className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:border-amber-500 outline-none transition placeholder:text-gray-300 dark:text-white/20" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">Account Number</label>
                                    <input type="text" required value={accountDetails.account_number} onChange={(e) => setAccountDetails({...accountDetails, account_number: e.target.value})} placeholder="00000000000" className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:border-amber-500 outline-none transition font-mono placeholder:font-sans placeholder:text-gray-300 dark:text-white/20" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-white/50 mb-2">IFSC / SWIFT Code</label>
                                    <input type="text" required value={accountDetails.ifsc_code} onChange={(e) => setAccountDetails({...accountDetails, ifsc_code: e.target.value})} placeholder="HDFC0001234" className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:border-amber-500 outline-none transition uppercase placeholder:normal-case placeholder:text-gray-300 dark:text-white/20" />
                                </div>

                                <button type="submit" disabled={isSaving} className="w-full mt-2 py-4 rounded-xl bg-amber-500 text-black font-black text-sm hover:bg-amber-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <><i className="fa-solid fa-shield-check"></i> Sync Account Details</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            {/* HIDDEN PAYSLIP TEMPLATE FOR PDF ENGINE */}
            {selectedPayslip && (
                <div className="hidden">
                    <div ref={payslipRef} className="w-[800px] bg-white p-10 flex flex-col font-sans text-black">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-6">
                            <div>
                                <h1 className="text-3xl font-black tracking-widest uppercase">Prudentia College of Law</h1>
                                <p className="text-sm font-bold text-gray-500 uppercase mt-1">Official Salary Slip</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-500 uppercase">Payslip ID</p>
                                <p className="text-sm font-black">{selectedPayslip.id.split('-')[0].toUpperCase()}</p>
                            </div>
                        </div>
                        
                        {/* Employee Details */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Employee ID</p>
                                <p className="text-sm font-bold">{userSession?.erp_id || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Salary Period</p>
                                <p className="text-sm font-bold">{selectedPayslip.month} {selectedPayslip.year}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Department</p>
                                <p className="text-sm font-bold">{userSession?.department || "Faculty"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Bank Account Number</p>
                                <p className="text-sm font-bold">{accountDetails?.account_number || "XX-XXXX-XXXX"}</p>
                            </div>
                        </div>
                        
                        {/* Financial Table */}
                        <div className="w-full border border-black rounded-lg overflow-hidden mb-8">
                            <div className="flex bg-gray-100 border-b border-black">
                                <div className="w-1/2 p-3 border-r border-black font-bold uppercase text-xs">Earnings</div>
                                <div className="w-1/2 p-3 font-bold uppercase text-xs">Deductions</div>
                            </div>
                            <div className="flex">
                                <div className="w-1/2 p-4 border-r border-black flex justify-between items-start h-32">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold">Basic Salary</span>
                                        <span className="text-sm font-bold">Allowances</span>
                                    </div>
                                    <div className="flex flex-col gap-2 text-right">
                                        <span className="text-sm">₹{selectedPayslip.basic_salary?.toLocaleString('en-IN') || "0"}</span>
                                        <span className="text-sm">₹{selectedPayslip.allowances?.toLocaleString('en-IN') || "0"}</span>
                                    </div>
                                </div>
                                <div className="w-1/2 p-4 flex justify-between items-start h-32">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-bold">TDS / Taxes</span>
                                        <span className="text-sm font-bold">Other Deductions</span>
                                    </div>
                                    <div className="flex flex-col gap-2 text-right">
                                        <span className="text-sm">₹{selectedPayslip.deductions?.toLocaleString('en-IN') || "0"}</span>
                                        <span className="text-sm text-gray-400">-</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-t border-black bg-gray-100">
                                <div className="w-1/2 p-3 border-r border-black flex justify-between items-center">
                                    <span className="font-bold uppercase text-xs">Gross Earnings</span>
                                    <span className="font-bold">₹{((selectedPayslip.basic_salary || 0) + (selectedPayslip.allowances || 0)).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="w-1/2 p-3 flex justify-between items-center">
                                    <span className="font-bold uppercase text-xs">Total Deductions</span>
                                    <span className="font-bold">₹{(selectedPayslip.deductions || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay */}
                        <div className="flex justify-between items-center border-t-2 border-black pt-6 mb-12">
                            <span className="text-xl font-black uppercase">Net Pay</span>
                            <span className="text-3xl font-black">₹{selectedPayslip.net_salary?.toLocaleString('en-IN') || "0"}</span>
                        </div>

                        {/* Signatures */}
                        <div className="mt-auto pt-20 flex justify-between">
                            <div className="w-40 border-t border-black text-center pt-2 text-xs font-bold uppercase text-gray-500">Finance Controller</div>
                            <div className="w-40 border-t border-black text-center pt-2 text-xs font-bold uppercase text-gray-500">Employee Signature</div>
                        </div>
                        
                        <div className="text-center mt-8 text-[10px] text-gray-400">
                            This is a system generated document and does not require a physical signature if accessed securely via PCL ERP.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

