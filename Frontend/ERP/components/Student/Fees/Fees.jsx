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

const getFeeTheme = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('tuition')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (t.includes('exam')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (t.includes('hostel')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  if (t.includes('transport')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
  return 'bg-themeTextSec/10 text-themeTextSec border-themeBorder';
};

const getFeeIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('tuition')) return 'fa-book-open';
  if (t.includes('exam')) return 'fa-file-lines';
  if (t.includes('hostel')) return 'fa-bed';
  if (t.includes('transport')) return 'fa-bus';
  return 'fa-file-invoice-dollar';
};

export default function Fees({ isEmbedded = false }) {
 const { userSession } = useERP();
 const studentId = userSession?.db_id || userSession?.id;

 // --- STATE ---
 const [view, setView] = useState("overview"); // 'overview' or 'history'
 const [isProcessing, setIsProcessing] = useState(false);
 const [successModal, setSuccessModal] = useState(null);
 const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState({
    upi_id: 'prudentia@icici',
    bank_name: 'ICICI Bank',
    account_name: 'PRUDENTIA COLLEGE OF LAW',
    account_number: '024305013005',
    ifsc_code: 'ICIC0000243'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('payment_gateway_settings').select('*').limit(1).single();
      if (data) {
        setPaymentSettings(data);
      }
    };
    fetchSettings();
  }, []);

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
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
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

 const groupMap = new Map();
 transactions.forEach(txn => {
 const dateKey = new Date(txn.created_at).toLocaleDateString('en-GB');
 const key = `${txn.student_id}_${txn.amount}_${dateKey}_${txn.status}`;
 if (!groupMap.has(key)) {
 groupMap.set(key, { ...txn, is_merged: false, merged_txns: [txn], all_utrs: [txn.reference_number].filter(Boolean) });
 } else {
 const existing = groupMap.get(key);
 existing.is_merged = true;
 existing.merged_txns.push(txn);
 if (txn.reference_number && !existing.all_utrs.includes(txn.reference_number)) {
 existing.all_utrs.push(txn.reference_number);
 }
 }
 });
 const dedupedTransactions = Array.from(groupMap.values());

 setFeeBreakdown(invoices);
 setTransactionHistory(dedupedTransactions);

 // Update session storage cache
 sessionStorage.setItem(`fees_invoices_${studentId}`, JSON.stringify(invoices));
 sessionStorage.setItem(`fees_transactions_${studentId}`, JSON.stringify(dedupedTransactions));

 // Auto-select pending fees for checkout if nothing was selected yet
 const pendingIds = invoices.filter(f => f.status === 'pending').map(f => f.id);
 
 setSelectedFees(prev => {
 // If they haven't interacted or we just loaded, keep pending items selected
 if (prev.length === 0 && pendingIds.length > 0) return pendingIds;
 return prev;
 });

 } catch (error) { console.error(error); if (window.toast) window.toast.error("An error occurred. Please try again."); }
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

 const initiatePayment = () => {
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
 const { data: txnData, error: txnError } = await supabase.from('fee_transactions').insert({
 id: transactionId,
 student_id: studentId,
 amount: currentTotal,
 status: 'pending', // Marks for Admin verification
 method: verificationData.mode,
 reference_number: verificationData.referenceNumber,
 transfer_date: verificationData.transferDate,
 purpose: purposeStr
 }).select();
 if (txnError) throw txnError;
 if (!txnData || txnData.length === 0) throw new Error("Transaction blocked by security policies (RLS).");

 // 2. Mark invoices as under_verification
 const { data: invData, error: invError } = await supabase
 .from('fee_invoices')
 .update({ status: 'under_verification' })
 .in('id', selectedFees)
 .select();
 if (invError) throw invError;
 if (!invData || invData.length === 0) throw new Error("Invoice update blocked by security policies (RLS).");

 // Refresh UI
 await fetchFinancialData();
 setIsVerificationModalOpen(false);
 setSuccessModal({ amount: currentTotal, transactionId: transactionId, isPending: true });

 } catch (error) { console.error(error); if (window.erpToast) window.erpToast.show(error.message || "An error occurred. Please try again.", "error"); } finally {
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
 
  if (isVerificationModalOpen) {
    return (
      <div className="min-h-screen bg-themeApp text-themeText animate-fade-in flex flex-col relative z-[200]">
        
        {/* Processing State */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-themeApp/80 animate-fade-in">
            <div className="bg-themePanel border border-themeBorder p-8 rounded-[2rem] flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-amber-500 mb-6"></i>
              <h3 className="text-xl font-black mb-2 text-center text-themeText">Processing Payment</h3>
              <p className="text-themeTextSec text-xs text-center mb-6 font-bold leading-relaxed">Securing your transaction with 256-bit SSL encryption. Please do not close this window.</p>
            </div>
          </div>
        )}

        {/* Top Navbar for full-screen view */}
        <div className="w-full px-6 py-6 border-b border-themeBorder flex items-center justify-between sticky top-0 bg-themeApp/80 backdrop-blur-xl z-40">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsVerificationModalOpen(false)} className="w-10 h-10 bg-themeElevated border border-themeBorder flex items-center justify-center rounded-full text-themeTextSec hover:text-themeText hover:bg-themePanel/20 transition-all">
                <i className="fa-solid fa-arrow-left text-sm"></i>
             </button>
             <h2 className="text-xl font-black text-themeText tracking-tight">Checkout</h2>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-themeElevated border border-themeBorder rounded-full text-xs font-bold text-themeTextSec">
             <i className="fa-solid fa-lock text-emerald-500"></i> Secure Payment
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 lg:py-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Instructions */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div>
                <h1 className="text-3xl lg:text-5xl font-black text-themeText tracking-tight mb-2">Complete your <br/> Payment.</h1>
                <p className="text-sm font-medium text-themeTextSec uppercase tracking-widest mt-2">Transfer <strong className="text-amber-500 font-black">{formatCurrency(currentTotal)}</strong> and submit details below.</p>
              </div>

              {verificationData.mode === 'NEFT' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 lg:p-10 animate-fade-in h-full flex flex-col justify-center">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-8 flex items-center gap-2"><i className="fa-solid fa-building-columns"></i> College Bank Details</p>
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-end border-b border-amber-500/10 pb-4"><span className="text-themeTextSec/60 font-bold uppercase tracking-widest text-[10px]">Bank Name</span><span className="font-black text-themeText text-lg">{paymentSettings.bank_name}</span></div>
                    <div className="flex justify-between items-end border-b border-amber-500/10 pb-4"><span className="text-themeTextSec/60 font-bold uppercase tracking-widest text-[10px]">Account Name</span><span className="font-black text-themeText text-lg">{paymentSettings.account_name}</span></div>
                    <div className="flex justify-between items-end border-b border-amber-500/10 pb-4"><span className="text-themeTextSec/60 font-bold uppercase tracking-widest text-[10px]">Account No.</span><div className="flex items-center gap-2"><span className="font-mono font-black text-themeText text-xl">{paymentSettings.account_number}</span></div></div>
                    <div className="flex justify-between items-end"><span className="text-themeTextSec/60 font-bold uppercase tracking-widest text-[10px]">IFSC Code</span><div className="flex items-center gap-2"><span className="font-mono font-black text-themeText text-xl">{paymentSettings.ifsc_code}</span></div></div>
                  </div>
                </div>
              )}
              
              {verificationData.mode === 'UPI' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 lg:p-10 animate-fade-in h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2"><i className="fa-brands fa-google-pay text-lg"></i> Scan via UPI</p>
                  
                  {paymentSettings.upi_qr_url ? (
                     <div className="w-48 h-48 lg:w-64 lg:h-64 bg-white p-4 rounded-3xl shadow-xl mx-auto mb-6">
                       <img src={paymentSettings.upi_qr_url} alt="UPI QR" className="w-full h-full object-contain mix-blend-multiply" />
                     </div>
                  ) : (
                     <div className="w-48 h-48 lg:w-64 lg:h-64 bg-themePanel rounded-3xl shadow-xl mx-auto mb-6 flex flex-col items-center justify-center border border-themeBorder text-themeTextSec">
                       <i className="fa-solid fa-qrcode text-6xl mb-4 text-emerald-500/30"></i>
                       <span className="text-[10px] font-bold uppercase tracking-widest">No QR Available</span>
                     </div>
                  )}
                  
                  <p className="text-sm font-medium text-themeTextSec mb-2">Or pay to UPI ID</p>
                  <p className="text-2xl font-black text-themeText font-mono px-6 py-3 bg-themeElevated rounded-xl border border-themeBorder inline-block">{paymentSettings.upi_id}</p>
                </div>
              )}
            </div>
            
            {/* Right: Form */}
            <div className="lg:col-span-5">
              <div className="bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder rounded-[2rem] p-6 lg:p-8 relative shadow-2xl h-full flex flex-col">
                <div className="mb-8 border-b border-themeBorder pb-6">
                   <h3 className="text-xs font-bold text-themeTextSec uppercase tracking-widest mb-1">Total Amount</h3>
                   <div className="text-4xl font-black text-themeText font-mono tracking-tight">{formatCurrency(currentTotal)}</div>
                </div>
                
                <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-6 flex-1">
                  <div>
                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Mode of Payment</label>
                    <select value={verificationData.mode} onChange={e => setVerificationData({...verificationData, mode: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-5 py-4 text-sm font-black text-themeText outline-none focus:border-amber-500 appearance-none">
                      <option value="NEFT">NEFT / RTGS</option>
                      <option value="UPI">UPI Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Reference No. / UTR</label>
                    <input type="text" required value={verificationData.referenceNumber} onChange={e => setVerificationData({...verificationData, referenceNumber: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-5 py-4 text-sm font-black text-themeText outline-none focus:border-amber-500" placeholder="Enter 12-digit UTR or Txn ID" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Transfer Date</label>
                    <input type="date" required value={verificationData.transferDate} onChange={e => setVerificationData({...verificationData, transferDate: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-5 py-4 text-sm font-black text-themeText outline-none focus:border-amber-500" />
                  </div>
                  <div className="flex-1 flex items-end mt-4">
                    <button type="submit" disabled={isProcessing} className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-themeApp font-black text-base rounded-xl transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                      {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated dark:bg-themeApp ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText " : ""}`}>
 <div className={`w-full max-w-[1800px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-10 lg:pb-10 xl:pb-8" : "pb-10"}`}>
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in relative z-20">

 {/* SUCCESS MODAL */}
  {successModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dynamic blurred backdrop */}
      <div className="absolute inset-0 bg-themeApp/80 dark:bg-black/60 backdrop-blur-xl animate-fade-in" onClick={() => setSuccessModal(null)}></div>
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-themePanel/90 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-themeBorder dark:border-white/[0.08] shadow-2xl rounded-[2rem] overflow-hidden transform transition-all animate-slide-up">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

        <div className="p-8 sm:p-10 flex flex-col items-center">
          
          {/* Animated Icon Ring */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl border-4 border-white dark:border-themePanel shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-check"></i>
            </div>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-themeText text-center mb-2">
            {successModal?.isPending ? 'Verification Pending' : 'Payment Successful'}
          </h3>
          
          <p className="text-sm font-medium text-themeTextSec text-center mb-8 max-w-[260px] leading-relaxed">
            {successModal?.isPending ? 'Your payment details of' : 'Your payment of'} <strong className="text-themeText font-black">{formatCurrency(successModal.amount)}</strong> has been securely processed.
          </p>

          {/* Receipt Details Box */}
          <div className="w-full bg-themeElevated/50 dark:bg-black/20 border border-themeBorder dark:border-white/[0.04] rounded-2xl p-5 mb-8 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-themeBorder dark:border-white/[0.04] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Transaction ID</span>
              <span className="font-mono text-sm font-black text-themeText">{successModal.transactionId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec">Date</span>
              <span className="font-mono text-sm font-black text-themeText">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => setSuccessModal(null)}
            className="w-full py-4 bg-themeText text-themeApp hover:bg-emerald-500 hover:text-white rounded-xl text-sm font-black transition-all flex justify-center items-center gap-2 shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-1"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Ledger
          </button>
        </div>
      </div>
    </div>
  )}

  <PageHeader 
 icon="fa-solid fa-file-invoice-dollar"
 title="Financial Ledger"
 subtitle="View outstanding dues, pay securely, and download receipts."
 />
 
 <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 no-print">


 <div className={`flex p-1.5 bg-themePanel border border-themeBorder rounded-2xl lg:rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar`}>
 <button type="button"
 onClick={() => setView("overview")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap ${view === "overview"
 ? theme.action.rowActive + " justify-center"
 : "text-themeTextSec hover:text-themeText border border-transparent"
 }`}
 >
 Outstanding Dues
 </button>
 <button type="button"
 onClick={() => setView("history")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-2xl text-[10px] lg:text-[14px] font-medium tracking-normal transition duration-300 whitespace-nowrap ${view === "history"
 ? theme.action.rowActive + " justify-center"
 : "text-themeTextSec hover:text-themeText border border-transparent"
 }`}
 >
 Payment History
 </button>
 </div>
 </div>


 {/* FINANCIAL STANDING DASHBOARD */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in no-print">
 <div className={`bg-themePanel border border-themeBorder rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
 <div>
 <p className="text-[13px] font-medium text-themeTextSec mb-2">Total Expected Fee</p>
 <h2 className="text-3xl font-semibold tracking-tight text-themeText font-mono">{formatCurrency(totalExpected)}</h2>
 </div>
 </div>
 
 <div className={`bg-themePanel border border-themeBorder rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
 <div className="flex justify-between items-start">
 <div>
 <p className="text-[13px] font-medium text-themeTextSec mb-2">Amount Paid</p>
 <h2 className="text-3xl font-semibold tracking-tight text-emerald-400 font-mono">{formatCurrency(totalPaid)}</h2>
 </div>
 <div className="w-12 h-12 rounded-full border-[4px] border-themeBorder flex items-center justify-center relative">
 <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-themePanel" />
 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset={113 - (113 * progressPercent) / 100} className="text-emerald-500 transition duration-1000" />
 </svg>
 <span className="text-[9px] font-black text-themeText ">{progressPercent}%</span>
 </div>
 </div>
 </div>

 <div className={`bg-themePanel border border-themeBorder rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
 <div>
 <p className="text-[13px] font-medium text-themeTextSec mb-2">Outstanding Dues</p>
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
 <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 lg:p-8 relative overflow-hidden text-themeText flex flex-col justify-between min-h-[300px] lg:min-h-[350px] group hover:border-amber-500/30 transition duration-500">
 {/* Background Glows */}

 <div className="relative z-10 flex justify-between items-start">
 <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center border border-themeBorder bg-transparent text-themeAccent text-xl lg:text-2xl`}>
 <i className="fa-solid fa-wallet"></i>
 </div>
 {currentTotal > 0 ? (
 <span className="px-3 py-1.5 bg-transparent text-rose-400 border border-themeBorder rounded-lg text-[9px] lg:text-[13px] font-medium">
 Dues Pending
 </span>
 ) : (
 <span className="px-3 py-1.5 bg-transparent text-emerald-400 border border-themeBorder rounded-lg text-[9px] lg:text-[13px] font-medium">
 All Clear
 </span>
 )}
 </div>

 <div className="relative z-10 mt-10 lg:mt-12 transition duration-300">
 <p className={`${theme.text.muted} font-bold text-[10px] lg:text-xs tracking-normal mb-1.5 lg:mb-2`}>Selected To Pay</p>
 <h2 className={`text-4xl lg:text-5xl font-black tracking-tight mb-2 transition-colors duration-300 ${currentTotal === 0 ? 'text-themeTextSec ' : 'text-themeText '}`}>
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
 ? 'bg-amber-500 text-[var(--theme-app)] hover:bg-amber-400 hover:-translate-y-0.5 active:scale-[0.98]'
 : 'bg-transparent text-themeTextSec cursor-not-allowed border border-transparent'
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
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}>Detailed Breakdown</h2>

 {feeBreakdown.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <p className="text-themeTextSec font-bold text-xs lg:text-sm">No fee records found in your ledger.</p>
 </div>
 ) : (
 <div className="bg-themePanel border border-themeBorder rounded-[2.5rem] overflow-hidden p-4 lg:p-6">
 {feeBreakdown.map((item) => {
 const isSelected = selectedFees.includes(item.id);
 const isInactive = item.status === "paid" || item.status === "under_verification";

 return (
 <div
 key={item.id}
 onClick={() => item.status === 'pending' && !isProcessing && toggleFeeSelection(item.id)}
 className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl lg:rounded-2xl transition duration-300 mb-2 last:mb-0 border-themeBorder ${isInactive
 ? 'opacity-50 grayscale bg-themePanel/5 backdrop-blur-sm border-themeBorder '
 : `bg-themeElevated backdrop-blur-xl border border-themeBorder hover:bg-themePanel/20 hover:border-white/30 cursor-pointer hover:border-amber-500/40 hover:-translate-y-0.5 ${isSelected ? 'border-amber-500/30 bg-amber-500/10' : 'border-transparent'}`
 }`}
 >
 <div className="flex items-center gap-3 lg:gap-4">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 border-themeBorder ${getFeeTheme(item.type)}`}>
 <i className={`fa-solid ${getFeeIcon(item.type)} text-base lg:text-lg`}></i>
 </div>
 <div>
 <h3 className={`text-sm lg:text-base font-black tracking-tight ${isInactive ? 'line-through text-themeTextSec ' : 'text-themeText '}`}>
 {item.title}
 </h3>
 <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} tracking-normal mt-0.5 flex flex-wrap items-center gap-2`}>
 {item.type} Fee
 {item.status === 'pending' && <span className="text-rose-500 flex items-center gap-1"><span className="w-1 h-1 bg-rose-500 rounded-full inline-block"></span> Due: {new Date(item.due_date).toLocaleDateString('en-GB')}</span>}
 </p>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6 w-full sm:w-auto shrink-0">
 <span className={`text-base lg:text-xl font-semibold tracking-tight ${isInactive ? 'text-themeTextSec ' : 'text-themeText '}`}>
 {formatCurrency(item.amount)}
 </span>

 {item.status === 'paid' ? (
 <span className="text-emerald-400 text-[9px] lg:text-[13px] font-medium flex items-center gap-1.5 bg-themePanel border border-themeBorder px-2.5 lg:px-3 py-1.5 rounded-lg">
 <i className="fa-solid fa-check"></i> Paid
 </span>
 ) : item.status === 'under_verification' ? (
 <span className="text-amber-500 text-[9px] lg:text-[13px] font-medium flex items-center gap-1.5 bg-themePanel border border-themeBorder px-2.5 lg:px-3 py-1.5 rounded-lg">
 <i className="fa-solid fa-clock fa-spin"></i> Verifying
 </span>
 ) : (
 <div className="relative flex items-center justify-center pointer-events-none shrink-0 ml-2">
 <input
 type="checkbox"
 checked={isSelected}
 readOnly
 className="peer appearance-none w-5 h-5 lg:w-6 lg:h-6 bg-transparent border border-themeBorder rounded-md lg:rounded-lg checked:bg-amber-500 checked:border-amber-500 transition outline-none"
 />
 <i className="fa-solid fa-check text-[var(--theme-app)] text-[10px] lg:text-xs absolute opacity-0 peer-checked:opacity-100 transition-opacity"></i>
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
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-receipt text-4xl lg:text-5xl text-neutral-600 mb-4"></i>
 <p className="text-themeTextSec font-bold text-xs lg:text-sm">No transactions have been recorded yet.</p>
 </div>
 ) : (
 <div className="bg-themePanel border border-themeBorder rounded-[2.5rem] overflow-hidden p-4 lg:p-6">
 {transactionHistory.map((txn) => (
 <div
 key={txn.id}
 className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 lg:p-5 rounded-2xl lg:rounded-2xl bg-themeElevated backdrop-blur-xl border border-themeBorder hover:bg-themePanel/20 hover:border-white/30 transition duration-300 hover:border-amber-500/40 hover:-translate-y-0.5 mb-2 last:mb-0`}
 >
 <div className="flex items-center gap-3 lg:gap-4 w-full md:w-auto">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 border-themeBorder ${txn.status === 'successful' ? 'bg-themePanel border border-themeBorder text-emerald-400 border-themeBorder ' : 'bg-themePanel border border-themeBorder text-rose-400 border-themeBorder '
 }`}>
 <i className={`fa-solid ${txn.status === 'successful' ? 'fa-arrow-down' : 'fa-xmark'} text-base lg:text-lg`}></i>
 </div>
 <div className="flex-1">
 <h3 className="text-sm lg:text-base font-black text-themeText tracking-tight leading-tight mb-1 truncate max-w-[200px] sm:max-w-md lg:max-w-xl" title={txn.purpose}>{txn.purpose}</h3>
 <div className="flex flex-wrap items-center gap-2 lg:gap-3">
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} tracking-normal`}>{new Date(txn.created_at).toLocaleDateString('en-GB')}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full hidden sm:block"></span>
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} tracking-normal hidden sm:block`}>{txn.method}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.secondary} tracking-normal`}>{txn.is_merged ? 'Grouped Entry' : txn.id}</span>
 {txn.is_merged && (
 <>
 <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
 <span className="text-[8px] lg:text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest"><i className="fa-solid fa-code-merge mr-1"></i>Merged ({txn.merged_txns.length})</span>
 </>
 )}
 </div>
 </div>
 </div>

 <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 lg:gap-3 border-themeBorder md:border-0 border-transparent pt-3 md:pt-0">
 <span className="text-base lg:text-xl font-semibold tracking-tight text-themeText ">{formatCurrency(txn.amount)}</span>
 <div className="flex items-center gap-2 lg:gap-3">
 <span className={`text-[8px] lg:text-[12px] font-medium px-2.5 py-1.5 rounded-lg border-themeBorder ${txn.status === 'successful' ? 'bg-themePanel border border-themeBorder text-emerald-400 border-themeBorder ' : 'bg-themePanel border border-themeBorder text-rose-400 border-themeBorder '
 }`}>
 {txn.status}
 </span>
 {txn.status === 'successful' && (
 <button type="button" onClick={() => handleDownloadInvoice(txn)} disabled={downloadingInvoiceId === txn.id} className="text-themeTextSec hover:text-themeAccent transition duration-300 bg-transparent hover:bg-themePanel border border-themeBorder w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-2xl flex items-center justify-center border-themeBorder disabled:opacity-50 disabled:cursor-not-allowed no-print" title="Download Receipt">
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
 </div></div>
 
 {/* Hidden Document Templates for PDF Generation */}
 <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none -z-50">
 <FeeReceiptTemplate ref={invoiceRef} invoiceData={selectedInvoice} studentData={userSession} />
 </div>
 </div>
 );
}