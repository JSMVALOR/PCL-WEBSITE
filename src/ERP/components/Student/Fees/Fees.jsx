/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import { motion } from 'framer-motion';
import React, { useState, useEffect } from "react";
import PageHeader from "../../shared/PageHeader/PageHeader";
import { theme } from '../../../../Shared/theme';
import { useERP } from "../../../context/ErpContext";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { generatePDF } from "../../../lib/pdfGenerator";

export default function Fees({ isEmbedded = false }) {
 const { userSession } = useERP();
 const studentId = userSession?.db_id || userSession?.id;

 // --- STATE ---
 const [view, setView] = useState("overview"); // 'overview' or 'history'
 const [isProcessing, setIsProcessing] = useState(false);
 const [successModal, setSuccessModal] = useState(null);

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

 const handlePayment = async () => {
 if (currentTotal === 0 || selectedFees.length === 0) return;
 setIsProcessing(true);

 try {
 // 1. Simulate Payment Gateway Delay
 await new Promise(resolve => setTimeout(resolve, 50));

 const transactionId = `TXN${Math.floor(Math.random() * 1000000000)}`;
 const purposeStr = feeBreakdown.filter(f => selectedFees.includes(f.id)).map(f => f.title).join(", ");

 // 2. Record the successful transaction in the ledger
 const { error: txnError } = await supabase.from('fee_transactions').insert({
 id: transactionId,
 student_id: studentId,
 amount: currentTotal,
 status: 'successful',
 method: 'Secured Payment Gateway',
 purpose: purposeStr
 });

 if (txnError) throw txnError;

 // 3. Mark selected invoices as Paid
 const { error: invError } = await supabase
 .from('fee_invoices')
 .update({ status: 'paid' })
 .in('id', selectedFees);

 if (invError) throw invError;

 // Refresh UI
 await fetchFinancialData();
 
 // Show success modal
 setSuccessModal({
 amount: currentTotal,
 transactionId: transactionId
 });

 } catch (error) {
 console.error("Transaction Failed:", error);
 window.erpDialog.alert("Payment Gateway Error. Please try again.");
 } finally {
 setIsProcessing(false);
 }
 };

 // --- UI HELPERS ---
 const formatCurrency = (amount) => {
 return new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 maximumFractionDigits: 0,
 }).format(amount);
 };

 const getFeeTheme = (type) => {
 switch (type) {
 case "academic": return "text-blue-400 bg-themePanel border-theme border-themeBorderStrong border-black/5 dark:border-white/10";
 case "accommodation": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
 case "penalty": return "text-rose-400 bg-themePanel border-theme border-themeBorderStrong border-black/5 dark:border-white/10";
 default: return "text-themeTextSec bg-neutral-800 border-black/5 dark:border-white/10";
 }
 };

 const getFeeIcon = (type) => {
 switch (type) {
 case "academic": return "fa-graduation-cap";
 case "accommodation": return "fa-bed";
 case "penalty": return "fa-circle-exclamation";
 default: return "fa-file-invoice";
 }
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 h-auto xl:h-full overflow-visible xl:overflow-hidden">
 <div className="flex-1 flex flex-col gap-6 overflow-visible xl:overflow-y-auto custom-scrollbar pb-10 xl:pb-0 h-auto xl:h-full relative xl:pr-2">
 <div className="w-full flex flex-col gap-6 lg:gap-8 animate-fade-in">

 {/* PROCESSING OVERLAY */}
 {isProcessing && (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-themePanel border-theme border-themeBorderStrong p-8 rounded-themePanel border border-black/5 dark:border-white/10 flex flex-col items-center max-w-sm w-full mx-4">
 <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-6"></i>
 <h3 className={`${theme.text.heading} text-xl mb-2 text-center text-themeText`}>Processing Payment</h3>
 <p className={`${theme.text.secondary} text-sm text-center mb-6`}>Securing your transaction with 256-bit SSL encryption. Please do not close this window.</p>
 <div className="w-full bg-white/10 backdrop-blur-[60px] border border-black/10 dark:border-white/20 h-2 rounded-full overflow-hidden">
 <div className="h-full bg-amber-500 animate-pulse rounded-full" style={{ width: '60%' }}></div>
 </div>
 </div>
 </div>
 )}

 {/* SUCCESS MODAL */}
 {successModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/80 animate-fade-in">
 <div className="bg-themePanel border-theme border-themeBorderStrong p-8 rounded-themePanel border-theme border-emerald-500/30 flex flex-col items-center max-w-sm w-full mx-4">
 <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-4 border border-emerald-500/20">
 <i className="fa-solid fa-check"></i>
 </div>
 <h3 className={`${theme.text.heading} text-xl mb-2 text-center text-themeText`}>Payment Successful!</h3>
 <p className={`${theme.text.secondary} text-sm text-center mb-6`}>
 Your payment of <span className="font-bold text-themeText">{formatCurrency(successModal.amount)}</span> has been securely processed.
 </p>
 <div className="w-full bg-white/10 backdrop-blur-[60px] border border-black/10 dark:border-white/20 rounded-lg p-4 mb-6 flex flex-col gap-2">
 <div className="flex justify-between text-xs">
 <span className="text-themeTextSec">Transaction ID</span>
 <span className="font-mono text-themeText">{successModal.transactionId}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="text-themeTextSec">Date</span>
 <span className="font-mono text-themeText">{new Date().toLocaleDateString('en-GB')}</span>
 </div>
 </div>
 <button 
 onClick={() => setSuccessModal(null)}
 className="w-full py-3 bg-white/10 backdrop-blur-[60px] border border-black/10 dark:border-white/20 hover:bg-neutral-800 text-themeText text-sm font-bold rounded-lg hover:border-themeAccent/50 transition duration-300"
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


 <div className={`flex p-1.5 bg-themePanel border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel w-full lg:w-fit overflow-x-auto no-scrollbar`}>
 <button
 onClick={() => setView("overview")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap ${view === "overview"
 ? theme.action.rowActive + " justify-center"
 : "text-themeTextSec opacity-70 hover:text-themeText border border-transparent"
 }`}
 >
 Outstanding Dues
 </button>
 <button
 onClick={() => setView("history")}
 className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap ${view === "history"
 ? theme.action.rowActive + " justify-center"
 : "text-themeTextSec opacity-70 hover:text-themeText border border-transparent"
 }`}
 >
 Payment History
 </button>
 </div>
 </div>


 {/* FINANCIAL STANDING DASHBOARD */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 animate-fade-in no-print">
 <div className={`bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Total Expected Fee</p>
 <h2 className="text-3xl font-black text-white font-mono">{formatCurrency(totalExpected)}</h2>
 </div>
 </div>
 
 <div className={`bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
 <div className="flex justify-between items-start">
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Amount Paid</p>
 <h2 className="text-3xl font-black text-emerald-400 font-mono">{formatCurrency(totalPaid)}</h2>
 </div>
 <div className="w-12 h-12 rounded-full border-[4px] border-black/5 dark:border-white/10 flex items-center justify-center relative">
 <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-themePanel" />
 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset={113 - (113 * progressPercent) / 100} className="text-emerald-500 transition duration-1000" />
 </svg>
 <span className="text-[9px] font-black text-white">{progressPercent}%</span>
 </div>
 </div>
 </div>

 <div className={`bg-themePanel border-theme border-themeBorderStrong rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Outstanding Dues</p>
 <h2 className="text-3xl font-black text-rose-400 font-mono">{formatCurrency(totalPending)}</h2>
 {totalPending === 0 ? (
 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-2"><i className="fa-solid fa-check-circle mr-1"></i> All Clear</p>
 ) : (
 <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Action Required</p>
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
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-themePanel p-6 lg:p-8 relative overflow-hidden text-themeText flex flex-col justify-between min-h-[300px] lg:min-h-[350px] group hover:border-themeAccent/30 transition duration-500">
 {/* Background Glows */}

 <div className="relative z-10 flex justify-between items-start">
 <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-themePanel flex items-center justify-center border border-black/5 dark:border-white/10 bg-transparent text-themeAccent text-xl lg:text-2xl`}>
 <i className="fa-solid fa-wallet"></i>
 </div>
 {currentTotal > 0 ? (
 <span className="px-3 py-1.5 bg-transparent text-rose-400 border border-black/5 dark:border-white/10 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
 Dues Pending
 </span>
 ) : (
 <span className="px-3 py-1.5 bg-transparent text-emerald-400 border border-black/5 dark:border-white/10 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
 All Clear
 </span>
 )}
 </div>

 <div className="relative z-10 mt-10 lg:mt-12 transition duration-300">
 <p className={`${theme.text.muted} font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-1.5 lg:mb-2`}>Selected To Pay</p>
 <h2 className={`text-4xl lg:text-5xl font-black tracking-tight mb-2 transition-colors duration-300 ${currentTotal === 0 ? 'text-themeTextSec opacity-70' : 'text-themeText'}`}>
 {formatCurrency(currentTotal)}
 </h2>
 <p className={`text-xs lg:text-sm font-semibold ${theme.text.secondary} flex items-center gap-2`}>
 <i className="fa-solid fa-file-invoice-dollar text-themeAccent"></i> {selectedFees.length} Item(s) Selected
 </p>
 </div>

 <button
 onClick={handlePayment}
 disabled={currentTotal === 0 || isProcessing}
 className={`relative z-10 w-full mt-6 lg:mt-8 py-4 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 flex justify-center items-center gap-2 overflow-hidden ${currentTotal > 0 && !isProcessing
 ? 'bg-amber-500 text-[#050505] hover:bg-amber-400 hover:-translate-y-0.5 active:scale-[0.98]'
 : 'bg-transparent text-themeTextSec opacity-70 cursor-not-allowed border border-transparent'
 }`}
 >
 Pay Securely <i className="fa-solid fa-arrow-right"></i>
 </button>
 </div>

 {/* Security Trust Badge */}
 <div className={`flex items-center justify-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.muted} no-print`}>
 <i className="fa-solid fa-lock text-themeAccent/50"></i> 256-bit SSL Encrypted
 </div>
 </div>

 {/* Right Column: Fee Breakdown (Takes 2/3) */}
 <div className="xl:col-span-2 flex flex-col gap-4">
 <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}>Detailed Breakdown</h2>

 {feeBreakdown.length === 0 ? (
 <div className="w-full py-16 text-center border-2 border-dashed border-black/10 dark:border-white/20 rounded-[2rem] bg-white/10 backdrop-blur-[60px] px-4 border border-black/5 dark:border-white/10">
 <p className="text-themeTextSec opacity-70 font-bold text-xs lg:text-sm">No fee records found in your ledger.</p>
 </div>
 ) : (
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2.5rem] overflow-hidden p-4 lg:p-6">
 {feeBreakdown.map((item) => {
 const isSelected = selectedFees.includes(item.id);

 return (
 <div
 key={item.id}
 onClick={() => item.status === 'pending' && !isProcessing && toggleFeeSelection(item.id)}
 className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 lg:p-5 rounded-themePanel lg:rounded-themePanel transition duration-300 mb-2 last:mb-0 border-theme ${item.status === 'paid'
 ? 'opacity-50 grayscale bg-white/5 backdrop-blur-sm border-black/5 dark:border-white/10'
 : `bg-white/10 backdrop-blur-[60px] border border-black/10 dark:border-white/20 hover:bg-white/20 hover:border-white/30 cursor-pointer hover:border-themeAccent/40 hover:-translate-y-0.5 ${isSelected ? 'border-themeAccent/30 bg-amber-500/[0.02]' : 'border-transparent'}`
 }`}
 >
 <div className="flex items-center gap-3 lg:gap-4">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center shrink-0 border-theme ${getFeeTheme(item.type)}`}>
 <i className={`fa-solid ${getFeeIcon(item.type)} text-base lg:text-lg`}></i>
 </div>
 <div>
 <h3 className={`text-sm lg:text-base font-black tracking-tight ${item.status === 'paid' ? 'line-through text-themeTextSec opacity-70' : 'text-themeText'}`}>
 {item.title}
 </h3>
 <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest mt-0.5 flex flex-wrap items-center gap-2`}>
 {item.type} Fee
 {item.status === 'pending' && <span className="text-rose-500 flex items-center gap-1"><span className="w-1 h-1 bg-rose-500 rounded-full inline-block"></span> Due: {new Date(item.due_date).toLocaleDateString('en-GB')}</span>}
 </p>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6 w-full sm:w-auto shrink-0">
 <span className={`text-base lg:text-xl font-black ${item.status === 'paid' ? 'text-themeTextSec opacity-70' : 'text-themeText'}`}>
 {formatCurrency(item.amount)}
 </span>

 {item.status === 'paid' ? (
 <span className="text-emerald-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-themePanel border-theme border-themeBorderStrong border border-black/5 dark:border-white/10 px-2.5 lg:px-3 py-1.5 rounded-lg">
 <i className="fa-solid fa-check"></i> Paid
 </span>
 ) : (
 <div className="relative flex items-center justify-center pointer-events-none shrink-0 ml-2">
 <input
 type="checkbox"
 checked={isSelected}
 readOnly
 className="peer appearance-none w-5 h-5 lg:w-6 lg:h-6 bg-transparent border border-black/5 dark:border-white/10 rounded-md lg:rounded-lg checked:bg-amber-500 checked:border-amber-500 transition outline-none"
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
 <div className="w-full py-16 lg:py-24 text-center border-2 border-dashed border-black/10 dark:border-white/20 rounded-[2rem] bg-white/10 backdrop-blur-[60px] px-4 border border-black/5 dark:border-white/10">
 <i className="fa-solid fa-receipt text-4xl lg:text-5xl text-neutral-600 mb-4"></i>
 <p className="text-themeTextSec font-bold text-xs lg:text-sm">No transactions have been recorded yet.</p>
 </div>
 ) : (
 <div className="bg-themePanel border-theme border-themeBorderStrong rounded-[2.5rem] overflow-hidden p-4 lg:p-6">
 {transactionHistory.map((txn) => (
 <div
 key={txn.id}
 className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 lg:p-5 rounded-themePanel lg:rounded-themePanel bg-white/10 backdrop-blur-[60px] border border-black/10 dark:border-white/20 hover:bg-white/20 hover:border-white/30 transition duration-300 hover:border-themeAccent/40 hover:-translate-y-0.5 mb-2 last:mb-0`}
 >
 <div className="flex items-center gap-3 lg:gap-4 w-full md:w-auto">
 <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center shrink-0 border-theme ${txn.status === 'successful' ? 'bg-themePanel border-theme border-themeBorderStrong text-emerald-400 border-black/5 dark:border-white/10' : 'bg-themePanel border-theme border-themeBorderStrong text-rose-400 border-black/5 dark:border-white/10'
 }`}>
 <i className={`fa-solid ${txn.status === 'successful' ? 'fa-arrow-down' : 'fa-xmark'} text-base lg:text-lg`}></i>
 </div>
 <div className="flex-1">
 <h3 className="text-sm lg:text-base font-black text-themeText tracking-tight leading-tight mb-1 truncate max-w-[200px] sm:max-w-md lg:max-w-xl" title={txn.purpose}>{txn.purpose}</h3>
 <div className="flex flex-wrap items-center gap-2 lg:gap-3">
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>{new Date(txn.created_at).toLocaleDateString('en-GB')}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full hidden sm:block"></span>
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest hidden sm:block`}>{txn.method}</span>
 <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
 <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.secondary} uppercase tracking-widest`}>{txn.id}</span>
 </div>
 </div>
 </div>

 <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 lg:gap-3 border-t-theme md:border-0 border-transparent pt-3 md:pt-0">
 <span className="text-base lg:text-xl font-black text-themeText">{formatCurrency(txn.amount)}</span>
 <div className="flex items-center gap-2 lg:gap-3">
 <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border-theme ${txn.status === 'successful' ? 'bg-themePanel border-theme border-themeBorderStrong text-emerald-400 border-black/5 dark:border-white/10' : 'bg-themePanel border-theme border-themeBorderStrong text-rose-400 border-black/5 dark:border-white/10'
 }`}>
 {txn.status}
 </span>
 {txn.status === 'successful' && (
 <button onClick={() => generatePDF(`Receipt_${txn.id}`)} className="text-themeTextSec opacity-70 hover:text-themeAccent transition duration-300 bg-transparent hover:bg-themePanel border-theme border-themeBorderStrong w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-themePanel flex items-center justify-center border border-black/5 dark:border-white/10 hover:border-themeAccent/50 no-print" title="Download Receipt">
 <i className="fa-solid fa-download text-[10px] lg:text-xs"></i>
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
 </div>
 );
}