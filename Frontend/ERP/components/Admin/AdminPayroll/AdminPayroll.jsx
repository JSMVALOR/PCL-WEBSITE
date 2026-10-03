/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { generateComponentPDF } from '../../../DocumentTemplates/pdfEngine';
import { generateNativePayslip } from '../../../DocumentTemplates/NativePayslipEngine';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

import { sendSystemEmail, sendSystemWhatsApp } from '../../../lib/EmailService';
import QRCode from 'react-qr-code';
import { getAvatarUrl } from '../../../utils/avatarUtils';


export default function AdminPayroll() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyFac, setHistoryFac] = useState(null);
  const [historyRolls, setHistoryRolls] = useState([]);

  // State for personalized pay overrides
  const [customBasePays, setCustomBasePays] = useState({});
 
 // Configuration state removed
 const [expandedCards, setExpandedCards] = useState([]);
 const [viewMode, setViewMode] = useState('grid');

 const toggleCardBreakdown = (id) => {
 setExpandedCards(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
 };
 
 // Payment Modal State
 const [selectedFac, setSelectedFac] = useState(null);
 const [showPaymentModal, setShowPaymentModal] = useState(false);
 const [paymentForm, setPaymentForm] = useState({
 transactionDate: new Date().toISOString().split('T')[0],
 paymentMode: 'Bank Transfer (NEFT/RTGS)',
 transactionId: ''
 });
 const [isProcessing, setIsProcessing] = useState(false);

 // Config logic removed
 
 // Breakdown logic removed

 const fetchFaculty = async () => {
 setLoading(true);
 try {
 const { data: facultyData, error } = await supabase.from('profiles').select('*').eq('role', 'faculty');
 if (error) throw error;
 if (facultyData) {
 const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 const monthIndex = months.indexOf(selectedMonth);
 const currentMonthStart = new Date(parseInt(selectedYear), monthIndex, 1);
 
 const currentMonthEnd = new Date(currentMonthStart);
 currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
 currentMonthEnd.setDate(0);
 currentMonthEnd.setHours(23,59,59,999);
 
 const { data: leaves } = await supabase
 .from('faculty_leaves')
 .select('faculty_id, from_date, to_date')
 .eq('status', 'approved')
 .gte('from_date', currentMonthStart.toISOString().split('T')[0]);

 const { data: attendanceLogs } = await supabase
 .from('faculty_daily_presence')
 .select('faculty_id, date, status, total_missed_minutes')
 .gte('date', currentMonthStart.toISOString().split('T')[0]);

 const { data: previousRolls } = await supabase
 .from('faculty_payroll')
 .select('*');
 
 setHistoryRolls(previousRolls || []);
 const currentMonth = selectedMonth;
 const currentYear = selectedYear;

 const enriched = facultyData.map(f => {
 const facLeaves = (leaves || []).filter(l => l.faculty_id === f.id);
 let totalLeaveDays = 0;
 
 facLeaves.forEach(l => {
 let start = new Date(l.from_date);
 let end = new Date(l.to_date);
 if (start < currentMonthStart) start = currentMonthStart;
 if (end >= start) {
 const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
 totalLeaveDays += diff;
 }
 });

 // Add manually enforced Admin absences and partial late minutes
 let enforcedAbsences = 0;
 (attendanceLogs || []).filter(log => log.faculty_id === f.id).forEach(log => {
 if (log.status === 'absent') {
 enforcedAbsences += 1;
 } else if (log.total_missed_minutes > 0) {
 // Assuming 8 hours (480 minutes) is a full day
 enforcedAbsences += log.total_missed_minutes / 480;
 }
 });
 totalLeaveDays += enforcedAbsences;

 const lopDays = enforcedAbsences; // Direct LOP based on late minutes and unapproved absence
 
 // Personalized Pay Logic: State Override -> DB Column -> Default Config
 const basePay = f.base_salary ? Number(f.base_salary) : 0;
 const waivedDays = 0;
 
 const dailyRate = basePay / 30;
 const grossLopAmount = Math.round(lopDays * dailyRate);
 const waivedAmount = 0;
 const deduction = Math.max(0, grossLopAmount - waivedAmount);
 
 const netPay = basePay - deduction;
 
 let struct = [];

 // Parse payment details
 let bankDetails = { bankName: 'Not Provided', accountNo: 'N/A', ifsc: 'N/A' };
 try {
 let qData = f.questionnaire_data || {};
 if (typeof qData === 'string') qData = JSON.parse(qData);
 if (qData.bankName) bankDetails.bankName = qData.bankName;
 if (qData.bankAccount) bankDetails.accountNo = qData.bankAccount;
 if (qData.bankIfsc) bankDetails.ifsc = qData.bankIfsc;
 } catch (e) { console.error("Error parsing bank details:", e); }

 // Check if already processed this month
 const isProcessed = (previousRolls || []).some(pr => pr.faculty_id === f.id && pr.month === currentMonth && pr.year === currentYear);

 return { 
 ...f, 
 basePay, 
 totalLeaveDays, 
 lopDays, 
 deduction, 
 netPay,
 salary_structure: struct,
 waivedDays,
 waivedAmount,
 grossLopAmount,
 waiverReason: '',
 bankDetails,
 isProcessed 
 };
 });

 setFaculty(enriched);
 }
 } catch (error) {
 console.error(error);
 if (window.erpToast) window.erpToast.show(error.message || "Failed to load payroll data. Please try again.", "error");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchFaculty(); }, [selectedMonth, selectedYear]);

 const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

 

 const handleOpenPayment = (fac) => {
 setSelectedFac(fac);
 setShowPaymentModal(true);
 // Reset form
 setPaymentForm(prev => ({
 ...prev,
 transactionId: '' }));
 };

 
 const handleConfirmPayment = async (e) => {
 e.preventDefault();
 const confirmed = window.erpDialog ? await window.erpDialog.confirm("Are you sure you want to finalize this payroll disbursal? This action will generate the encrypted PDF and cannot be undone.", "Confirm Disbursal") : window.confirm("Finalize payroll?");
 if (!confirmed) return;
 
 setIsProcessing(true);
 try {
 const finalNetPay = selectedFac.netPay;
 
 const payload = {
 faculty_id: selectedFac.id,
 base_pay: selectedFac.basePay,
 base_salary: selectedFac.basePay, // Legacy column required by DB constraint
 
 deductions: selectedFac.deduction,
 net_pay: selectedFac.netPay, // Pre-tax net
 final_net_pay: finalNetPay, // Post-tax net
 professional_tax: 0,
 tds_amount: 0,
 tds_percentage: 0,
 transaction_id: paymentForm.transactionId,
 payment_mode: paymentForm.paymentMode,
 month: new Date().toLocaleString('default', { month: 'long' }),
 year: new Date().getFullYear().toString(),
 payment_date: paymentForm.transactionDate,
 lop_days: selectedFac.lopDays,
 lop_waived_days: selectedFac.waivedDays || 0,
 lop_waived_amount: selectedFac.waivedAmount || 0,
 lop_waiver_reason: selectedFac.waiverReason || '',
 salary_structure: selectedFac.salary_structure,
 gross_lop_amount: selectedFac.grossLopAmount || 0
 };

 // 1. Database Insert
 const { error } = await supabase.from('faculty_payroll').insert([payload]);
 if (error) throw error;
 await supabase.from('notices').insert([{
 notice_id: `PAY-${Date.now()}`,
 title: 'Payroll Disbursed',
 category: 'Finance',
 target_audience: ['faculty'],
 target_user_id: selectedFac.id,
 priority: 'high',
 content: `Your salary for ${payload.month} ${payload.year} has been disbursed.`,
 author_name: 'Finance Department',
 author_id: null
 }]);
 // Bell notification for payroll
 if (selectedFac.id) {
   await supabase.from('notifications').insert([{
     recipient_id: selectedFac.id,
     title: 'Payroll Disbursed',
     message: 'Your salary slip has been processed.',
     type: 'notice',
     action_link: 'payroll'
   }]);
 }

 // 2. Generate Ultra Luxury PDF via NATIVE ENGINE (Zero DOM Dependency)
 const base64Pdf = await generateNativePayslip(
 payload, 
 selectedFac.full_name, 
 selectedFac.erp_id,
 "Faculty of Law"
 );

 // 3. Download the PDF directly for the Admin
 const linkSource = `data:application/pdf;base64,${base64Pdf}`;
 const downloadLink = document.createElement("a");
 downloadLink.href = linkSource;
 downloadLink.download = `Payslip_${selectedFac.full_name}_${payload.month}.pdf`;
 downloadLink.click();

 // 4. Optional: Email Dispatch
 await sendSystemEmail('PAYROLL_DISBURSAL', {
 to_email: selectedFac.email,
 faculty_name: selectedFac.full_name,
 month: payload.month,
 year: payload.year,
 payment_mode: payload.payment_mode,
 final_net_pay: payload.final_net_pay,
 erp_id: selectedFac.erp_id,
 attachment: base64Pdf,
 attachment_name: `Payslip_${selectedFac.full_name.replace(/ /g, '_')}_${payload.month}.pdf`
 });
 if (selectedFac.phone) {
 sendSystemWhatsApp(selectedFac.phone, null, { template_id: 'PAYROLL_DISBURSAL', variables: { faculty_name: selectedFac.full_name, month: payload.month, year: payload.year, net_pay: payload.final_net_pay }, recipient_name: selectedFac.full_name }).catch(e => console.error('WA failed:', e));
 }

 setFaculty(prev => prev.map(f => f.id === selectedFac.id ? { ...f, isProcessed: true } : f));
 
 if(window.erpToast) window.erpToast.show("✅ Payroll disbursed & payslip securely dispatched.", "success");
 setShowPaymentModal(false);

 } catch (err) { 
 console.error(err); 
 if (err.code === 'PGRST204' || (err.message && err.message.includes('does not exist'))) {
 window.erpDialog?.alert("Database schema is missing new payroll columns (TDS, Pro Tax, etc.). Please execute the pending SQL in Backend/all_pending_fixes.sql", "Schema Error");
 } else {
 window.erpDialog?.alert(err.message || "An error occurred while processing payroll. Please try again.", "Error");
 }
 } finally {
 setIsProcessing(false);
 }
 };

 // --- Missing Functions (Audit Fix #2) ---
 const handleFacultyPropUpdate = (facId, prop, value) => {
 setFaculty(prev => prev.map(f => {
 if (f.id !== facId) return f;
 const updated = { ...f, [prop]: Number(value) || 0 };
 // Recalculate net pay when basePay changes
 if (prop === 'basePay') {
 const dailyRate = updated.basePay / 30;
 const grossLop = Math.round(updated.lopDays * dailyRate);
 updated.deduction = Math.max(0, grossLop - (updated.waivedAmount || 0));
 updated.netPay = updated.basePay - updated.deduction;
 updated.grossLopAmount = grossLop;
 }
 return updated;
 }));
 };

 const handleSaveProfileSalary = async (fac) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ base_salary: fac.basePay, /* salary_structure removed */ })
        .eq('id', fac.id);
      if (error) throw error;
      if (window.erpToast) window.erpToast.show('✅ Salary profile updated successfully.', 'success');
    } catch (e) {
      console.error(e);
      if (window.erpToast) window.erpToast.show('Error saving profile.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

 const handleDisburseAll = async () => {
   const unprocessed = faculty.filter(f => !f.isProcessed);
   if (unprocessed.length === 0) {
     if (window.erpDialog) window.erpDialog.alert("All faculty payrolls are already processed for this month.", "info");
     return;
   }
   
   const confirmed = window.erpDialog ? await window.erpDialog.confirm(`You are about to automatically finalize and disburse payroll for ${unprocessed.length} faculty members. This will generate encrypted PDFs and send emails. Proceed?`, "Bulk Disbursal") : window.confirm(`Disburse ${unprocessed.length} payrolls?`);
   if (!confirmed) return;

   setIsProcessing(true);
   let successCount = 0;
   const currentMonth = new Date().toLocaleString('default', { month: 'long' });
   const currentYear = new Date().getFullYear().toString();
   const payDate = new Date().toISOString().split('T')[0];

   try {
     for (const fac of unprocessed) {
       // Standard automated deduction assumptions for bulk
       const finalNetPay = fac.netPay;
       const transactionId = `AUTO-TXN-${Date.now()}-${fac.id.slice(0, 4)}`;

       const payload = {
         faculty_id: fac.id,
         base_pay: fac.basePay,
         base_salary: fac.basePay,
         deductions: fac.deduction,
         net_pay: fac.netPay,
         final_net_pay: finalNetPay,
         professional_tax: 0,
         tds_amount: 0,
         tds_percentage: 0,
         transaction_id: transactionId,
         payment_mode: 'Bank Transfer (NEFT/RTGS)',
         month: currentMonth,
         year: currentYear,
         payment_date: payDate,
         lop_days: fac.lopDays,
         lop_waived_days: fac.waivedDays || 0,
         lop_waived_amount: fac.waivedAmount || 0,
         lop_waiver_reason: fac.waiverReason || '',
         salary_structure: fac.salary_structure,
         gross_lop_amount: fac.grossLopAmount || 0
       };

       const { error } = await supabase.from('faculty_payroll').insert([payload]);
       if (error) continue;

       await supabase.from('notices').insert([{
         notice_id: `PAY-${Date.now()}-${fac.id}`,
         title: 'Payroll Disbursed',
         category: 'Finance',
         target_audience: ['faculty'],
         target_user_id: fac.id,
         priority: 'high',
         content: `Your salary for ${currentMonth} ${currentYear} has been disbursed.`,
         author_name: 'Finance Department',
         author_id: null
       }]);

       await supabase.from('notifications').insert([{
         recipient_id: fac.id,
         title: 'Payroll Disbursed',
         message: 'Your salary slip has been processed.',
         type: 'notice',
         action_link: 'payroll'
       }]);

       const base64Pdf = await generateNativePayslip(
         payload, 
         fac.full_name, 
         fac.erp_id,
         "Faculty of Law"
       );

       await sendSystemEmail('PAYROLL_DISBURSAL', {
         to_email: fac.email,
         faculty_name: fac.full_name,
         month: payload.month,
         year: payload.year,
         payment_mode: payload.payment_mode,
         final_net_pay: payload.final_net_pay,
         erp_id: fac.erp_id,
         attachment: base64Pdf,
         attachment_name: `Payslip_${fac.full_name.replace(/ /g, '_')}_${payload.month}.pdf`
       });

       if (fac.phone) {
         sendSystemWhatsApp(fac.phone, null, { template_id: 'PAYROLL_DISBURSAL', variables: { faculty_name: fac.full_name, month: payload.month, year: payload.year, net_pay: payload.final_net_pay }, recipient_name: fac.full_name }).catch(e => console.error('WA failed:', e));
       }

       successCount++;
       setFaculty(prev => prev.map(f => f.id === fac.id ? { ...f, isProcessed: true } : f));
     }
     if (window.erpToast) window.erpToast.show(`✅ Successfully processed ${successCount} out of ${unprocessed.length} payrolls.`, "success");
   } catch (err) {
     console.error(err);
     if (window.erpDialog) window.erpDialog.alert("An error occurred during bulk processing.", "Error");
   } finally {
     setIsProcessing(false);
   }
 };

 return (
 <section className="w-full animate-fade-in pb-12">

 <div className="w-full mt-6">
 
 {/* FACULTY ROSTER CARDS */}
 <div className="w-full">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h2 className="text-xl font-black text-themeText tracking-tight">Faculty Payroll</h2>
 <div className="flex items-center gap-2 mt-2">
 <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-themeElevated border border-themeBorder rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-themeText outline-none focus:border-amber-500 cursor-pointer">
   {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
 </select>
 <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-themeElevated border border-themeBorder rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest text-themeText outline-none focus:border-amber-500 cursor-pointer">
   {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y.toString()}>{y}</option>)}
 </select>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex bg-themeElevated rounded-xl p-1 border border-themeBorder ">
 <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-themePanel dark:bg-themeElevated shadow-sm text-themeText' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeApp'}`}>
 <i className="fa-solid fa-border-all"></i> Grid
 </button>
 <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-themePanel dark:bg-themeElevated shadow-sm text-themeText' : 'text-themeTextSec hover:text-themeText dark:hover:text-themeApp'}`}>
 <i className="fa-solid fa-list"></i> List
 </button>
 </div>
 <button 
   onClick={handleDisburseAll}
   disabled={isProcessing || !faculty.some(f => !f.isProcessed)}
   className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-themeText rounded-xl text-xs font-black transition-colors flex items-center gap-2"
 >
   {isProcessing ? <><i className="fa-solid fa-spinner animate-spin"></i> Processing...</> : <><i className="fa-solid fa-check-double"></i> Approve & Disburse All</>}
 </button>
 </div>
 </div>

 {loading ? (
 <div className="w-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
 ) : (
 <>
 {viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {faculty.map(f => (
 <div key={f.id} className="bg-themePanel/60 dark:bg-themePanel/60 backdrop-blur-xl border border-themeBorder/50 dark:border-white/[0.05] rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
 {f.isProcessed && (
 <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 backdrop-blur-sm">
 <i className="fa-solid fa-check mr-1"></i> Paid
 </div>
 )}
 
 <div className="flex items-center gap-4 mb-6">
 <img src={getAvatarUrl({ name: f.full_name, avatar_url: f.profile_picture_url })} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(f.full_name)}&background=random&color=fff&rounded=true&bold=true`; }} alt={f.full_name} className="w-14 h-14 rounded-2xl object-cover border border-themeBorder shadow-sm" />
 <div>
 <h4 className="text-base font-black text-themeText tracking-tight">{f.full_name}</h4>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">{f.erp_id}</p>
 </div>
 </div>
 
 <div className="flex-1 bg-themeElevated/50 backdrop-blur-sm rounded-2xl p-5 border border-themeBorder/50 flex flex-col gap-4">
 
 {/* Base Pay Section */}
 <div className="flex justify-between items-start">
 <div>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest flex items-center gap-1.5 mb-1">
 Base Salary 
 </span>
 <div className="flex items-center gap-1">
 <span className="text-sm font-bold text-themeTextSec">₹</span>
 <input 
 type="number"
 value={f.basePay}
 onChange={(e) => handleFacultyPropUpdate(f.id, 'basePay', e.target.value)}
 className="bg-transparent border-b border-transparent hover:border-themeBorder text-lg font-black text-themeText font-mono w-28 outline-none focus:border-amber-500 transition-colors py-0.5"
 />
 </div>
 </div>
 <div className="text-right">
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Leaves / LOP</span>
 <span className="text-sm font-black text-rose-500">{f.totalLeaveDays} <span className="text-[10px] font-bold text-rose-500/50">/ {f.lopDays}</span></span>
 </div>
 </div>

 {/* Personalized Salary Breakdown (Editable) */}
 {expandedCards.includes(f.id) && (
 <div className="flex flex-col gap-2 p-4 bg-themePanel/50 rounded-xl border border-themeBorder/50 animate-fade-in">
 <div className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-1 flex justify-between items-center pb-2 border-b border-themeBorder/50">
 <span>Pay Structure</span>
 <button onClick={() => setFaculty(prev => prev.map(fac => fac.id === f.id ? { ...fac, salary_structure: [...(fac.salary_structure || []), { name: 'New Component', percentage: 0 }] } : fac))} className="text-amber-500 hover:text-amber-600 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
 <i className="fa-solid fa-plus text-[8px]"></i> Add
 </button>
 </div>
 {(f.salary_structure || []).map((b, i) => (
 <div key={i} className="flex gap-2 items-center group">
 <input type="text" value={b.name} onChange={e => handleUpdateStructure(f.id, i, 'name', e.target.value)} className="w-full flex-1 bg-transparent border-b border-transparent hover:border-themeBorder focus:border-amber-500 text-[10px] font-bold text-themeText outline-none transition-colors" />
 <div className="flex items-center bg-themeElevated rounded px-1.5 py-0.5">
 <input type="number" value={b.percentage} onChange={e => handleUpdateStructure(f.id, i, 'percentage', e.target.value)} className="w-8 bg-transparent text-xs font-black text-amber-500 outline-none text-right" />
 <span className="text-[10px] text-amber-500/50 ml-0.5">%</span>
 </div>
 <div className="flex items-center gap-1 px-1">
 <span className="text-[10px] text-themeTextSec font-bold">₹</span>
 <span className="w-12 text-[10px] font-medium text-themeTextSec font-mono text-right">{Math.round(f.basePay * (b.percentage / 100)).toLocaleString('en-IN')}</span>
 </div>
 <button onClick={() => setFaculty(prev => prev.map(fac => fac.id === f.id ? { ...fac, salary_structure: fac.salary_structure.filter((_, idx) => idx !== i) } : fac))} className="text-rose-500/0 group-hover:text-rose-500/50 hover:!text-rose-500 transition-colors w-4 text-center">
 <i className="fa-solid fa-xmark text-[10px]"></i>
 </button>
 </div>
 ))}
 </div>
 )}
 
 <div className="w-full h-px bg-themeBorder/50"></div>
 
 <div className="flex justify-between items-end">
 <div>
 <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Net Disbursal</span>
 <span className="text-2xl font-black text-emerald-500 font-mono tracking-tight">₹{f.netPay.toLocaleString('en-IN')}</span>
 </div>
 {f.deduction > 0 && (
 <div className="text-right">
 <span className="text-[9px] font-bold text-rose-500/70 uppercase tracking-widest block mb-1">Deduction</span>
 <span className="text-xs font-black text-rose-500 font-mono">-₹{f.deduction.toLocaleString('en-IN')}</span>
 </div>
 )}
 </div>
 
 </div>

 <div className="flex items-center gap-2 mt-4">
 <button onClick={() => { setHistoryFac(f); setShowHistoryModal(true); }} className="w-12 py-3.5 bg-themeElevated hover:bg-themeBorder text-themeText rounded-2xl text-xs font-black transition-colors flex items-center justify-center border border-themeBorder">
 <i className="fa-solid fa-clock-rotate-left"></i>
 </button>
 {!f.isProcessed ? (
 <button 
 onClick={() => handleOpenPayment(f)} 
 className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-themeText rounded-2xl text-xs font-black transition-all duration-300 shadow-[0_4px_14px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
 >
 <i className="fa-solid fa-bolt"></i> Disburse Pay
 </button>
 ) : (
 <div className="flex-1 py-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border border-emerald-500/20">
 <i className="fa-solid fa-check"></i> Paid
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 
 <div className="flex flex-col gap-3">
 {faculty.map(f => (
 <div key={f.id} className="bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-black/10 ">
 
 <div className="flex items-center gap-4 flex-1">
 <img src={getAvatarUrl({ name: f.full_name, avatar_url: f.profile_picture_url })} alt={f.full_name} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(f.full_name)}&background=random&color=fff&rounded=true&bold=true`; }} className="w-10 h-10 rounded-full object-cover border border-themeBorder shadow-sm" />
 <div className="flex flex-col">
 <div className="flex items-center gap-2">
 <h4 className="text-sm font-black text-themeText ">{f.full_name}</h4>
 {f.isProcessed && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Paid</span>}
 </div>
 <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">{f.erp_id} • {f.totalLeaveDays} LVS / {f.lopDays} LOP</p>
 </div>
 </div>

 <div className="flex flex-col items-start md:items-end flex-1">
 <span className="text-[9px] font-black text-themeTextSec/40 uppercase tracking-widest">Base / Net Disbursal</span>
 <div className="flex items-center gap-2 mt-0.5">
 {f.deduction > 0 && <span className="text-xs font-bold text-rose-500/70 line-through">₹{f.basePay.toLocaleString('en-IN')}</span>}
 <span className="text-sm font-black text-emerald-500 font-mono tracking-tight">₹{f.netPay.toLocaleString('en-IN')}</span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button onClick={() => { setHistoryFac(f); setShowHistoryModal(true); }} className="px-4 py-2.5 bg-themeElevated hover:bg-themeBorder text-themeText rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 border border-themeBorder">
 <i className="fa-solid fa-clock-rotate-left"></i>
 </button>
 <button 
 onClick={() => handleOpenPayment(f)}
 disabled={f.isProcessed}
 className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-themePanel/5 text-themeText disabled:text-themeTextSec/50 rounded-xl text-xs font-black transition-all shadow-[0_4px_14px_rgba(245,158,11,0.2)] disabled:shadow-none hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)] disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
 >
 {f.isProcessed ? <><i className="fa-solid fa-check"></i> Paid</> : <><i className="fa-solid fa-bolt"></i> Disburse</>}
 </button>
 
 </div>

 {/* Expandable Breakdown in List View */}
 {expandedCards.includes(f.id) && (
 <div className="w-full basis-full mt-4 pt-4 border-t border-themeBorder flex flex-col md:flex-row gap-6 animate-fade-in">
 <div className="flex-1 bg-themePanel/50 rounded-xl p-4 border border-themeBorder/50">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Salary Structure</span>
 {f.salary_structure?.map((item, i) => (
 <div key={i} className="flex justify-between text-[10px] font-bold py-1">
 <span className="text-themeText/80">{item.name} ({item.percentage}%)</span>
 <span className="text-themeText font-mono">₹{Math.round(f.basePay * (item.percentage / 100)).toLocaleString('en-IN')}</span>
 </div>
 ))}
 </div>
 <div className="flex-1 bg-themePanel/50 rounded-xl p-4 border border-themeBorder/50">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Account Details</span>
 <div className="flex flex-col gap-1 text-[10px] font-bold">
 <div className="flex justify-between"><span className="text-themeTextSec">Bank:</span> <span className="text-themeText">{f.bankDetails?.bankName || 'N/A'}</span></div>
 <div className="flex justify-between"><span className="text-themeTextSec">Acct:</span> <span className="text-themeText font-mono">{f.bankDetails?.accountNo || 'N/A'}</span></div>
 <div className="flex justify-between"><span className="text-themeTextSec">IFSC:</span> <span className="text-themeText font-mono">{f.bankDetails?.ifsc || 'N/A'}</span></div>
 </div>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>

 )}
 </>

 )}
 </div>
 </div>

 {/* PAYMENT TRANSACTION MODAL */}
  {showPaymentModal && selectedFac && createPortal(
  <div className="fixed inset-0 z-50 bg-themeApp flex flex-col animate-fade-in overflow-hidden">
  <div className="w-full h-full bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex flex-col">
  
  {/* Header */}
  <div className="px-6 py-6 lg:px-12 lg:py-8 border-b border-themeBorder bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex justify-between items-center shrink-0">
  <div>
  <h3 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 tracking-tight drop-shadow-sm">Finalize Payroll Disbursal</h3>
  <p className="text-xs lg:text-sm font-bold tracking-widest text-themeTextSec uppercase mt-2">Transaction Details for {selectedFac.full_name}</p>
  </div>
  <button onClick={() => setShowPaymentModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-themePanel/5 text-themeTextSec hover:text-themeText hover:bg-themePanel/10 transition text-lg shadow-sm border border-themeBorder/50">
  <i className="fa-solid fa-xmark"></i>
  </button>
  </div>

  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 flex justify-center">
  <div className="w-full max-w-3xl flex flex-col gap-8">
  
  {/* Salary Breakdown Recap */}
  <div className="bg-themeElevated border border-themeBorder rounded-3xl p-6 lg:p-8 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-2"><i className="fa-solid fa-calculator text-[10px]"></i> Calculation Recap</p>
  
  <div className="flex justify-between items-center"><span className="text-sm font-bold text-themeTextSec">Base Salary</span><span className="text-base font-black text-themeText font-mono">{formatCurrency(selectedFac.basePay)}</span></div>
  <div className="flex justify-between items-center"><span className="text-sm font-bold text-rose-500/80">LOP Penalty</span><span className="text-base font-black text-rose-500 font-mono">-{formatCurrency(selectedFac.deduction)}</span></div>
  
  <div className="w-full h-px bg-themeBorder my-2"></div>
  
  <div className="flex justify-between items-center"><span className="text-base font-black text-themeText uppercase tracking-widest">Gross Payable</span><span className="text-xl font-black text-emerald-500 font-mono">{formatCurrency(selectedFac.netPay)}</span></div>
  </div>

  <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2 mb-2"><i className="fa-solid fa-building-columns text-[10px]"></i> Bank Transfer Details</p>
  <div className="flex justify-between items-center"><span className="text-sm font-bold text-themeTextSec">Bank Name</span><span className="text-sm font-black text-themeText">{selectedFac.bankDetails?.bankName || 'Not Provided'}</span></div>
  <div className="flex justify-between items-center"><span className="text-sm font-bold text-themeTextSec">Account No</span><span className="text-sm font-black text-themeText font-mono">{selectedFac.bankDetails?.accountNo || 'N/A'}</span></div>
  <div className="flex justify-between items-center"><span className="text-sm font-bold text-themeTextSec">IFSC Code</span><span className="text-sm font-black text-themeText font-mono">{selectedFac.bankDetails?.ifsc || 'N/A'}</span></div>
  </div>

  <form id="payment-form" onSubmit={handleConfirmPayment} className="flex flex-col gap-6">
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  <div>
  <label className="text-[10px] font-black text-themeTextSec uppercase tracking-widest block mb-2">Transaction Date <span className="text-amber-500">*</span></label>
  <input type="date" required value={paymentForm.transactionDate} onChange={e => setPaymentForm({...paymentForm, transactionDate: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-5 py-4 text-sm font-bold text-themeText outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all" />
  </div>
  <div>
  <label className="text-[10px] font-black text-themeTextSec uppercase tracking-widest block mb-2">Payment Mode <span className="text-amber-500">*</span></label>
  <div className="relative">
  <select required value={paymentForm.paymentMode} onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-5 py-4 text-sm font-bold text-themeText outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all appearance-none cursor-pointer">
  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
  <option value="UPI">UPI Payment</option>
  <option value="Cheque">Physical Cheque</option>
  </select>
  <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-themeTextSec text-xs pointer-events-none"></i>
  </div>
  </div>
  </div>

  <div>
  <label className="text-[10px] font-black text-themeTextSec uppercase tracking-widest block mb-2">Transaction Ref / ID <span className="text-amber-500">*</span></label>
  <input type="text" required placeholder="e.g. UTR123456789" value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-5 py-4 text-sm font-bold text-themeText placeholder-themeTextSec/30 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-mono" />
  </div>
  
  <div className="bg-emerald-500/10 p-6 lg:p-8 rounded-3xl border border-emerald-500/20 flex justify-between items-center mt-4 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none"></div>
  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest z-10 flex items-center gap-2"><i className="fa-solid fa-money-bill-wave"></i> Final Disbursal</span>
  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono z-10">{formatCurrency(selectedFac.netPay)}</span>
  </div>
  
  </form>
  </div>
  </div>

  <div className="p-6 lg:p-8 border-t border-themeBorder bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex justify-end gap-4 shrink-0">
  <button onClick={() => setShowPaymentModal(false)} className="px-8 py-4 bg-themePanel/5 hover:bg-themePanel/10 rounded-xl text-themeTextSec hover:text-themeText text-sm font-black transition-colors border border-themeBorder/50">Cancel</button>
  <button form="payment-form" type="submit" disabled={isProcessing} className="px-8 py-4 bg-amber-500 hover:bg-amber-400 rounded-xl text-themeText text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 flex items-center gap-2">
  {isProcessing ? 'Processing Encryption...' : <><i className="fa-solid fa-lock text-black/40"></i> Encrypt & Disburse</>}
  </button>
  </div>
  </div>
  </div>
  , document.body)}

 </section>
 );
}
