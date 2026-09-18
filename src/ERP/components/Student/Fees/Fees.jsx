/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import { motion } from 'framer-motion';
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { theme } from '../../../../Shared/theme';
import FeeReceiptTemplate from '../../../DocumentTemplates/FeeReceiptTemplate';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { generateComponentPDF } from "../../../DocumentTemplates/pdfEngine";
import { useRef } from "react";

export default function Fees({}) {
 const { userSession } = useERP();
 const studentId = userSession?.db_id || userSession?.id;

 // --- STATE ---
 const [view, setView] = useState("overview"); // 'overview' or 'history'
 const [isProcessing, setIsProcessing] = useState(false);
 const [successModal, setSuccessModal] = useState(null);
 const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
 const [verificationData, setVerificationData] = useState({
 mode: 'NEFT',
 referenceNumber: '',
 transferDate: new Date().toISOString().split('T')[0]
 });

 const invoiceRef = useRef(null);
 const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
 const [selectedInvoice, setSelectedInvoice] = useState(null);

 const handleDownloadInvoice = async (txn) => {
     setDownloadingInvoiceId(txn.id);
     setSelectedInvoice(txn);
     
     // Wait for React to render the hidden template
     setTimeout(async () => {
         if (invoiceRef.current) {
             try {
                 await generateComponentPDF(invoiceRef.current, `Invoice_${txn.id}.pdf`, { format: 'a4', orientation: 'portrait' });
             } catch (e) {
                 console.error("Failed to download invoice:", e);
             }
         }
         setDownloadingInvoiceId(null);
         setSelectedInvoice(null);
     }, 300);
 };

 // --- LIVE DATA STATES WITH SESSION STORAGE CACHE FOR ZERO LAG ---
 const [feeBreakdown, setFeeBreakdown] = useState(() => {
 if (studentId) {
 const cached = sessionStorage.getItem(`fees_invoices_${studentId}`);
 if (cached) return JSON.parse(cached);
 }
 return [];
 });

 const [transactionHistory, setTransactionHistory] = useState(() => {
 if (studentId) {
 const cached = sessionStorage.getItem(`fees_transactions_${studentId}`);
 if (cached) return JSON.parse(cached);
 }
 return [];
 });

 const [selectedFees, setSelectedFees] = useState(() => {
 if (studentId) {
 const cached = sessionStorage.getItem(`fees_invoices_${studentId}`);
 if (cached) {
 const invoices = JSON.parse(cached);
 return invoices.filter(f => f.status === 'pending').map(f => f.id);
 }
 }
 return [];
 });

 // --- DATA SYNC ENGINE (PARALLEL FETCH) ---
 const fetchFinancialData = async () => {
 if (!studentId) return;

 try {
 // Fetch Outstanding Invoices & Transaction Ledger concurrently
 const [invoicesRes, transactionsRes] = await Promise.all([
 supabase
 .from('fee_invoices')
 .select('*')
 .eq('student_id', studentId)
 .order('due_date', { ascending: true }),
 supabase
 .from('fee_transactions')
 .select('*')
 .eq('student_id', studentId)
 .order('created_at', { ascending: false })
 ]);

 if (invoicesRes.error) throw invoicesRes.error;
 if (transactionsRes.error) throw transactionsRes.error;

 const invoices = invoicesRes.data || [];
 const transactions = transactionsRes.data || [];

 setFeeBreakdown(invoices);
 setTransactionHistory(transactions);

 // Update session storage cache
 sessionStorage.setItem(`fees_invoices_${studentId}`, JSON.stringify(invoices));
 sessionStorage.setItem(`fees_transactions_${studentId}`, JSON.stringify(transactions));

 // Auto-select pending fees for checkout if nothing was selected yet
 const pendingIds = invoices.filter(f => f.status === 'pending').map(f => f.id);
 
 setSelectedFees(prev => {
 // If they haven't interacted or we just loaded, keep pending items selected
 if (prev.length === 0 && pendingIds.length > 0) return pendingIds;
 return prev;
 });

 } catch (error) {
 console.error("Failed to fetch financial ledgers:", error);
 }
 };

 useEffect(() => {
 fetchFinancialData();
 }, [studentId]);

 // --- CHECKOUT ENGINE ---
 const currentTotal = feeBreakdown
 .filter(f => selectedFees.includes(f.id))
 .reduce((sum, item) => sum + Number(item.amount), 0);

 const toggleFeeSelection = (id) => {
 setSelectedFees(prev =>
 prev.includes(id) ? prev.filter(feeId => feeId !== id) : [...prev, id]
 );
 };

 // --- FINANCIAL METRICS ---
 const totalExpected = feeBreakdown.reduce((sum, item) => sum + Number(item.amount), 0);
 const totalPaid = feeBreakdown.filter(f => f.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0);
 const totalPending = feeBreakdown.filter(f => f.status === 'pending').reduce((sum, item) => sum + Number(item.amount), 0);
 const progressPercent = totalExpected === 0 ? 100 : Math.round((totalPaid / totalExpected) * 100);

 const initiatePayment = ({ isEmbedded = false }) => {
        if (currentTotal === 0 || selectedFees.length === 0) return;
        setIsVerificationModalOpen(true);
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const transactionId = `TXN${Math.floor(Math.random() * 1000000000)}`;
            const purposeStr = feeBreakdown.filter(f => selectedFees.includes(f.id)).map(f => f.title).join(", ");

            // 1. Record pending transaction
            const { error: txnError } = await supabase.from('fee_transactions').insert({
                id: transactionId,
                student_id: studentId,
                amount: currentTotal,
                status: 'pending', // Marks for Admin verification
                method: verificationData.mode,
                reference_number: verificationData.referenceNumber,
                transfer_date: verificationData.transferDate,
                purpose: purposeStr
            });
            if (txnError) throw txnError;

            // 2. Mark invoices as under_verification
            const { error: invError } = await supabase
                .from('fee_invoices')
                .update({ status: 'under_verification' })
                .in('id', selectedFees);
            if (invError) throw invError;

            // Refresh UI
            await fetchFinancialData();
            setIsVerificationModalOpen(false);
            setSuccessModal({ amount: currentTotal, transactionId: transactionId, isPending: true });

        } catch (error) {
            console.error("Payment submission failed:", error);
            alert("Failed to submit verification. Please check your connection.");
        } finally {
            setIsProcessing(false);
        }
    };

    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    return (
 <div className={`w-full animate-fade-in selection:bg-gray-100 dark:bg-[#1A1A1A] ${!isEmbedded ? "min-h-screen bg-themeApp text-gray-900 dark:text-white" : ""}`}>
 <div className={`w-full mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 <div className="relative z-20 w-full w-full mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 <div className="flex-1 flex flex-col gap-6 overflow-visible xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2">
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">

 {/* PROCESSING OVERLAY */}
 {isProcessing && (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-8 rounded-2xl border border-gray-200 dark:border-white/5 flex flex-col items-center max-w-sm w-full mx-4">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-6"></i>
 <h3 className={`${theme.text.heading} text-xl mb-2 text-center text-gray-900 dark:text-white`}>Processing Payment</h3>
 <p className={`${theme.text.secondary} text-sm text-center mb-6`}>Securing your transaction with 256-bit SSL encryption. Please do not close this window.</p>
 <div className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/5 h-2 rounded-full overflow-hidden">
 <div className="h-full bg-amber-500 animate-pulse rounded-full" style={{ width: '60%' }}></div>
 </div>
 </div>
 </div>
 )}

 
 {/* VERIFICATION MODAL */}
 {isVerificationModalOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/80 animate-fade-in px-4">
 <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-none rounded-[2rem] p-6 lg:p-8 max-w-md w-full relative">
 <button onClick={() => setIsVerificationModalOpen(false)} className="absolute top-6 right-6 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white transition-colors">
 <i className="fa-solid fa-xmark text-xl"></i>
 </button>
 <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Verify Payment</h2>
 <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest mb-6">Submit your transaction details for admin verification.</p>
 
 {verificationData.mode === 'NEFT' && (
     <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-2 animate-fade-in">
         <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><i className="fa-solid fa-building-columns"></i> College Bank Details</p>
         <div className="flex flex-col gap-2">
             <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-white/60 font-medium">Bank Name</span><span className="font-black text-gray-900 dark:text-white tracking-tight">HDFC Bank Ltd.</span></div>
             <div className="flex justify-between text-xs"><span className="text-gray-500 dark:text-white/60 font-medium">Account Name</span><span className="font-black text-gray-900 dark:text-white tracking-tight">Prudentia College of Law</span></div>
             <div className="flex justify-between text-xs items-center"><span className="text-gray-500 dark:text-white/60 font-medium">Account No.</span><div className="flex items-center gap-2"><span className="font-mono font-black text-gray-900 dark:text-white tracking-tight">50200012345678</span><button type="button" onClick={() => navigator.clipboard.writeText('50200012345678')} className="text-amber-500 hover:text-amber-600"><i className="fa-regular fa-copy"></i></button></div></div>
             <div className="flex justify-between text-xs items-center"><span className="text-gray-500 dark:text-white/60 font-medium">IFSC Code</span><div className="flex items-center gap-2"><span className="font-mono font-black text-gray-900 dark:text-white tracking-tight">HDFC0001234</span><button type="button" onClick={() => navigator.clipboard.writeText('HDFC0001234')} className="text-amber-500 hover:text-amber-600"><i className="fa-regular fa-copy"></i></button></div></div>
         </div>
     </div>
 )}
 
 {verificationData.mode === 'UPI' && (
     <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-2 animate-fade-in flex items-center justify-between">
         <div>
             <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-2"><i className="fa-brands fa-google-pay"></i> College UPI ID</p>
             <div className="flex items-center gap-2 mt-2">
                <p className="text-sm font-black text-gray-900 dark:text-white font-mono tracking-tight">prudentia@hdfcbank</p>
                <button type="button" onClick={() => navigator.clipboard.writeText('prudentia@hdfcbank')} className="text-emerald-500 hover:text-emerald-600"><i className="fa-regular fa-copy"></i></button>
             </div>
         </div>
         <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-sm flex items-center justify-center">
            <i className="fa-solid fa-qrcode text-3xl text-gray-900"></i>
         </div>
     </div>
 )}

 {verificationData.mode === 'Demand Draft' && (
     <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-2 animate-fade-in">
         <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2"><i className="fa-solid fa-money-check"></i> DD Instructions</p>
         <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed font-medium">Draw the Demand Draft in favor of <strong className="text-gray-900 dark:text-white font-black">"Prudentia College of Law"</strong>, payable at <strong className="text-gray-900 dark:text-white font-black">Hyderabad</strong>. Submit the physical DD to the accounts office.</p>
     </div>
 )}
 
 <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
 <div>
 <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Mode of Payment</label>
 <select value={verificationData.mode} onChange={e => setVerificationData({...verificationData, mode: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent appearance-none">
 <option value="NEFT">NEFT / RTGS</option>
 <option value="UPI">UPI Transfer</option>
 <option value="Demand Draft">Demand Draft</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Reference No. / UTR</label>
 <input type="text" required value={verificationData.referenceNumber} onChange={e => setVerificationData({...verificationData, referenceNumber: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent" placeholder="Enter Transaction ID" />
 </div>
 <div>
 <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Transfer Date</label>
 <input type="date" required value={verificationData.transferDate} onChange={e => setVerificationData({...verificationData, transferDate: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-gray-200 dark:border-white/5Accent" />
 </div>
 <button type="submit" disabled={isProcessing} className="w-full py-3.5 bg-themeAccent text-gray-900 dark:text-white font-black text-sm rounded-xl hover:bg-themeAccent/90 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50">
 {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Submit for Verification'}
 </button>
 </form>
 </div>
 </div>
 )}
 
 {/* SUCCESS MODAL */}
 {successModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] p-8 rounded-2xl border-gray-200 dark:border-white/5 border-emerald-500/30 flex flex-col items-center max-w-sm w-full mx-4">
 <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-emerald-500/20">
 <i className="fa-solid fa-check"></i>
 </div>
 <h3 className={`${theme.text.heading} text-xl mb-2 text-center text-gray-900 dark:text-white`}>{successModal?.isPending ? 'Verification Pending' : 'Payment Successful'}!</h3>
 <p className={`${theme.text.secondary} text-sm text-center mb-6`}>
 {successModal?.isPending ? 'Your payment details of' : 'Your payment of'} <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(successModal.amount)}</span> has been securely processed.
 </p>
 <div className="w-full bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/5 rounded-lg p-4 mb-6 flex flex-col gap-2">
 <div className="flex justify-between text-xs">
 <span className="text-gray-500 dark:text-white/50">Transaction ID</span>
 <span className="font-mono text-gray-900 dark:text-white">{successModal.transactionId}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-gray-500 dark:text-white/50">Date</span>
 <span className="font-mono text-gray-900 dark:text-white">{new Date().toLocaleDateString('en-GB')}</span>
 </div>
 </div>
 <button type="button" 
 onClick={() => setSuccessModal(null)}
 className="w-full py-3 bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold rounded-lg hover:border-gray-200 dark:border-white/5Accent/50 transition duration-300"
 >
 Back to Ledger
 </button>
 </div>
 </div>
 )}

 <PageHeader 
 icon="fa-solid fa-file-invoice-dollar"
 title="Financial Ledger"
 subtitle="View outstanding dues, pay securely, and download receipts."
 />
 
 <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 no-print">


 <div className={`flex p-1.5 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl lg:rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar`}>
 <button type="button"
 onClick={() => setView("overview")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap ${view === "overview"
 ? theme.action.rowActive + " justify-center"
 : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white border border-transparent"
 }`}
 >
 Outstanding Dues
 </button>
 <button type="button"
 onClick={() => setView("history")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap ${view === "history"
 ? theme.action.rowActive + " justify-center"
 : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white border border-transparent"
 }`}
 >
 Payment History
 </button>
 </div>
 </div>


 {/* FINANCIAL STANDING DASHBOARD */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in no-print">
 <div className={`bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
 <div>
 <p className="text-[13px] font-medium text-gray-500 dark:text-white/50 mb-2">Total Expected Fee</p>
 <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white font-mono">{formatCurrency(totalExpected)}</h2>
 </div>
 </div>
 
 <div className={`bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
 <div className="flex justify-between items-start">
 <div>
 <p className="text-[13px] font-medium text-gray-500 dark:text-white/50 mb-2">Amount Paid</p>
 <h2 className="text-3xl font-semibold tracking-tight text-emerald-400 font-mono">{formatCurrency(totalPaid)}</h2>
 </div>
 <div className="w-12 h-12 rounded-full border-[4px] border-gray-200 dark:border-white/5 flex items-center justify-center relative">
 <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-themePanel" />
 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset={113 - (113 * progressPercent) / 100} className="text-emerald-500 transition duration-1000" />
 </svg>
 <span className="text-[9px] font-black text-gray-900 dark:text-white">{progressPercent}%</span>
 </div>
 </div>
 </div>

 <div className={`bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
 <div>
 <p className="text-[13px] font-medium text-gray-500 dark:text-white/50 mb-2">Outstanding Dues</p>
 <h2 className="text-3xl font-semibold tracking-tight text-rose-400 font-mono">{formatCurrency(totalPending)}</h2>
 {totalPending === 0 ? (
 <p className="text-[10px] font-bold text-emerald-500 tracking-normal mt-2"><i className="fa-solid fa-check-circle mr-1"></i> All Clear</p>
 ) : (
 <p className="text-[10px] font-bold text-rose-500 tracking-normal mt-2"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Action Required</p>
 )}
 </div>
 </div>
 </div>

 {/* VIEW: OUTSTANDING DUES */}
 
 
 
 {view === "overview" && (
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">

 {/* Left Column: Digital Wallet Card (Takes 1/3) */}
 <div className="xl:col-span-1 flex flex-col gap-6">

 {/* The Master Card */}
 <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 lg:p-8 relative overflow-hidden text-gray-900 dark:text-white flex flex-col justify-between min-h-[300px] lg:min-h-[350px] group hover:border-gray-200 dark:border-white/5Accent/30 transition duration-500">
 {/* Background Glows */}

 <div className="relative z-10 flex justify-between items-start">
 <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-white/5 bg-transparent text-themeAccent text-xl lg:text-2xl`}>
 <i className="fa-solid fa-wallet"></i>
 </div>
 {currentTotal > 0 ? (
 <span className="px-3 py-1.5 bg-transparent text-rose-400 border border-gray-200 dark:border-white/5 rounded-lg text-[9px] lg:text-[13px] font-medium">
 Dues Pending
 </span>
 ) : (
 <span className="px-3 py-1.5 bg-transparent text-emerald-400 border border-gray-200 dark:border-white/5 rounded-lg text-[9px] lg:text-[13px] font-medium">
 All Clear
 </span>
 )}
 </div>

 <div className="relative z-10 mt-10 lg:mt-12 transition duration-300">
 <p className={`${theme.text.muted} font-bold text-[10px] lg:text-xs tracking-normal mb-1.5 lg:mb-2`}>Selected To Pay</p>
 <h2 className={`text-4xl lg:text-5xl font-black tracking-tight mb-2 transition-colors duration-300 ${currentTotal === 0 ? 'text-gray-500 dark:text-white/50' : 'text-gray-900 dark:text-white'}`}>
 {formatCurrency(currentTotal)}
 </h2>
 <p className={`text-xs lg:text-sm font-semibold ${theme.text.secondary} flex items-center gap-2`}>
 <i className="fa-solid fa-file-invoice-dollar text-themeAccent"></i> {selectedFees.length} Item(s) Selected
 </p>
 </div>

 <button type="button"
 onClick={initiatePayment}
 disabled={currentTotal === 0 || isProcessing}
 className={`relative z-10 w-full mt-6 lg:mt-8 py-4 rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 flex justify-center items-center gap-2 overflow-hidden ${currentTotal > 0 && !isProcessing
 ? 'bg-amber-500 text-[#050505] hover:bg-amber-400 hover:-translate-y-0.5 active:scale-[0.98]'
 : 'bg-transparent text-gray-500 dark:text-white/50 cursor-not-allowed border border-transparent'
 }`}
 >
 Pay Securely <i className="fa-solid fa-arrow-right"></i>
 </button>
 </div>

 {/* Security Trust Badge */}
 <div className={`flex items-center justify-center gap-2 lg:gap-3 text-[9px] lg:text-[13px] font-medium ${theme.text.muted} no-print`}>
 <i className="fa-solid fa-lock text-themeAccent/50"></i> 256-bit SSL Encrypted
 </div>
 </div>

 {/* Right Column: Fee Breakdown (Takes 2/3) */}
 <div className="xl:col-span-2 flex flex-col gap-4">
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-gray-900 dark:text-white tracking-tight ml-2`}>Detailed Breakdown</h2>

 {feeBreakdown.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <p className="text-gray-500 dark:text-white/50 font-bold text-xs lg:text-sm">No fee records found in your ledger.</p>
 </div>
 ) : (
 <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2.5rem] overflow-hidden p-4 lg:p-6">
 {feeBreakdown.map((item) => {
 const isSelected = selectedFees.includes(item.id);

 return (
 <div
 key={item.id}
 onClick={() => item.status === 'pending' && !isProcessing && toggleFeeSelection(item.id)}
 className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl lg:rounded-2xl transition duration-300 mb-2 last:mb-0 border-gray-200 dark:border-white/5 ${item.status === 'paid'
 ? 'opacity-50 grayscale bg-white/5 backdrop-blur-sm border-gray-200 dark:border-white/5'
 : `bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/5 hover:bg-white/20 hover:border-white/30 cursor-pointer hover:border-gray-200 dark:border-white/5Accent/40 hover:-translate-y-0.5 ${isSelected ? 'border-gray-200 dark:border-white/5Accent/30 bg-amber-500/10' : 'border-transparent'}`
 }`}
 >
 <div className="flex items-center gap-3 lg:gap-4">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 border-gray-200 dark:border-white/5 ${getFeeTheme(item.type)}`}>
 <i className={`fa-solid ${getFeeIcon(item.type)} text-base lg:text-lg`}></i>
 </div>
 <div>
 <h3 className={`text-sm lg:text-base font-black tracking-tight ${item.status === 'paid' ? 'line-through text-gray-500 dark:text-white/50' : 'text-gray-900 dark:text-white'}`}>
 {item.title}
 </h3>
 <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} tracking-normal mt-0.5 flex flex-wrap items-center gap-2`}>
 {item.type} Fee
 {item.status === 'pending' && <span className="text-rose-500 flex items-center gap-1"><span className="w-1 h-1 bg-rose-500 rounded-full inline-block"></span> Due: {new Date(item.due_date).toLocaleDateString('en-GB')}</span>}
 </p>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6 w-full sm:w-auto shrink-0">
 <span className={`text-base lg:text-xl font-semibold tracking-tight ${item.status === 'paid' ? 'text-gray-500 dark:text-white/50' : 'text-gray-900 dark:text-white'}`}>
 {formatCurrency(item.amount)}
 </span>

 {item.status === 'paid' ? (
 <span className="text-emerald-400 text-[9px] lg:text-[13px] font-medium flex items-center gap-1.5 bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] border border-gray-200 dark:border-white/5 px-2.5 lg:px-3 py-1.5 rounded-lg">
 <i className="fa-solid fa-check"></i> Paid
 </span>
 ) : (
 <div className="relative flex items-center justify-center pointer-events-none shrink-0 ml-2">
 <input
 type="checkbox"
 checked={isSelected}
 readOnly
 className="peer appearance-none w-5 h-5 lg:w-6 lg:h-6 bg-transparent border border-gray-200 dark:border-white/5 rounded-md lg:rounded-lg checked:bg-amber-500 checked:border-amber-500 transition outline-none"
 />
 <i className="fa-solid fa-check text-[#050505] text-[10px] lg:text-xs absolute opacity-0 peer-checked:opacity-100 transition-opacity"></i>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 )}

 {/* VIEW: PAYMENT HISTORY */}
 {view === "history" && (
 <div className="flex flex-col gap-5 lg:gap-6 animate-fade-in">
 {transactionHistory.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-receipt text-4xl lg:text-5xl text-neutral-600 mb-4"></i>
 <p className="text-gray-500 dark:text-white/50 font-bold text-xs lg:text-sm">No transactions have been recorded yet.</p>
 </div>
 ) : (
 <div className="bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] rounded-[2.5rem] overflow-hidden p-4 lg:p-6">
 {transactionHistory.map((txn) => (
 <div
 key={txn.id}
 className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl lg:rounded-2xl bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/5 hover:bg-white/20 hover:border-white/30 transition duration-300 hover:border-gray-200 dark:border-white/5Accent/40 hover:-translate-y-0.5 mb-2 last:mb-0`}
 >
 <div className="flex items-center gap-3 lg:gap-4 w-full md:w-auto">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 border-gray-200 dark:border-white/5 ${txn.status === 'successful' ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] text-emerald-400 border-gray-200 dark:border-white/5' : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] text-rose-400 border-gray-200 dark:border-white/5'
 }`}>
 <i className={`fa-solid ${txn.status === 'successful' ? 'fa-arrow-down' : 'fa-xmark'} text-base lg:text-lg`}></i>
 </div>
 <div className="flex-1">
 <h3 className="text-sm lg:text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-1 truncate max-w-[200px] sm:max-w-md lg:max-w-xl" title={txn.purpose}>{txn.purpose}</h3>
 <div className="flex flex-wrap items-center gap-2 lg:gap-3">
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} tracking-normal`}>{new Date(txn.created_at).toLocaleDateString('en-GB')}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full hidden sm:block"></span>
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} tracking-normal hidden sm:block`}>{txn.method}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.secondary} tracking-normal`}>{txn.id}</span>
 </div>
 </div>
 </div>

 <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 lg:gap-3 border-gray-200 dark:border-white/5 md:border-0 border-transparent pt-3 md:pt-0">
 <span className="text-base lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{formatCurrency(txn.amount)}</span>
 <div className="flex items-center gap-2 lg:gap-3">
 <span className={`text-[8px] lg:text-[12px] font-medium px-2.5 py-1.5 rounded-lg border-gray-200 dark:border-white/5 ${txn.status === 'successful' ? 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] text-emerald-400 border-gray-200 dark:border-white/5' : 'bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] text-rose-400 border-gray-200 dark:border-white/5'
 }`}>
 {txn.status}
 </span>
 {txn.status === 'successful' && (
 <button type="button" onClick={() => handleDownloadInvoice(txn)} disabled={downloadingInvoiceId === txn.id} className="text-gray-500 dark:text-white/50 hover:text-themeAccent transition duration-300 bg-transparent hover:bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-2xl flex items-center justify-center border-gray-200 dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed no-print" title="Download Receipt">
                                {downloadingInvoiceId === txn.id ? <i className="fa-solid fa-circle-notch fa-spin text-[10px] lg:text-xs"></i> : <i className="fa-solid fa-download text-[10px] lg:text-xs"></i>}
                            </button>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div></div></div></div>
 
            {/* Hidden Document Templates for PDF Generation */}
            <div className="hidden">
                <FeeReceiptTemplate ref={invoiceRef} invoiceData={selectedInvoice} studentData={userSession} />
            </div>
        </div>
    );
}