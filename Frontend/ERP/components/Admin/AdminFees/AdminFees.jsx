/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useMemo, useRef } from 'react';

import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { generateComponentPDF } from '../../../DocumentTemplates/pdfEngine';
import { sendSystemEmail } from '../../../lib/EmailService';
import QRCode from 'react-qr-code';
import FeeReceiptTemplate from '../../../DocumentTemplates/FeeReceiptTemplate';
import { useERP } from '../../../context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";
import AdminPayroll from '../AdminPayroll/AdminPayroll';

export default function AdminFees({ isEmbedded = false, }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState('overview'); 
 const [loading, setLoading] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState({ id: '', upi_id: '', upi_qr_url: '', bank_name: '', account_name: '', account_number: '', ifsc_code: '' });
 const [recurringExpenses, setRecurringExpenses] = useState([]);
 const [newExpense, setNewExpense] = useState({ title: '', amount: '' });

 // --- OVERVIEW STATE ---
 const [overviewData, setOverviewData] = useState({ totalExpected: 0, totalCollected: 0, pendingCount: 0, payrollExpense: 0 });
 const [fetchingOverview, setFetchingOverview] = useState(true);

 // --- VERIFICATIONS STATE ---
 const [pendingVerifications, setPendingVerifications] = useState([]);
 const [isVerifying, setIsVerifying] = useState(false);
 const luxuryInvoiceRef = useRef(null);
 const [currentTxnPayload, setCurrentTxnPayload] = useState(null);
  const [selectedVerificationDetail, setSelectedVerificationDetail] = useState(null);

 // --- BATCH MANAGER STATE ---
 const [batches, setBatches] = useState([]);
 const [selectedBatch, setSelectedBatch] = useState('');
 const [students, setStudents] = useState([]);
 const [selectedStudentIds, setSelectedStudentIds] = useState([]);
 
 const [assignTitle, setAssignTitle] = useState('');
 const [assignAmount, setAssignAmount] = useState('');
 const [assignDueDate, setAssignDueDate] = useState('');
 const [customAmounts, setCustomAmounts] = useState({});
 const [batchHistory, setBatchHistory] = useState([]);
 const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

 // --- INVOICE HISTORY STATE ---
 const [invoiceHistory, setInvoiceHistory] = useState([]);

 const fetchPaymentSettings = async () => {
    try {
      const { data } = await supabase.from('payment_gateway_settings').select('*').limit(1).single();
      if (data) setPaymentSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPaymentSettings(); }, []);

  useEffect(() => {
 if (activeTab === 'overview') fetchOverview();
 if (activeTab === 'verifications') fetchVerifications();
 if (activeTab === 'invoice_history') fetchInvoiceHistory();
 if (activeTab === 'batch') {
 fetchBatches();
 if (selectedBatch) fetchBatchStudents(selectedBatch);
 }
 }, [activeTab]);

 useEffect(() => {
 if (selectedBatch && activeTab === 'batch') fetchBatchStudents(selectedBatch);
 }, [selectedBatch]);

 // ================== FETCH LOGIC ==================
 const handleAddExpense = async (e) => {
 e.preventDefault();
 if (!newExpense.title || !newExpense.amount) return;
 try {
 const { error } = await supabase.from('recurring_expenses').insert([{ title: newExpense.title, amount: Number(newExpense.amount) }]);
 if (error) throw error;
 setNewExpense({ title: '', amount: '' });
 fetchOverview();
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };
 
 const handleRemoveExpense = async (id) => {
 if (window.erpDialog && !(await new Promise(r => window.erpDialog.confirm("Are you sure you want to delete this expense?", r)))) return;
 try {
 const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
 if (error) throw error;
 fetchOverview();
 if(window.erpToast) window.erpToast.show('Expense deleted successfully.', 'success');
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 const fetchOverview = async () => {
 setFetchingOverview(true);
 try {
 const { data: invoices } = await supabase.from('fee_invoices').select('amount, status');
 
 const currentMonth = new Date().toLocaleString('default', { month: 'long' });
 const currentYear = new Date().getFullYear().toString();
 const { data: payroll } = await supabase.from('faculty_payroll').select('final_net_pay').eq('month', currentMonth).eq('year', currentYear);
 const { data: recurringData } = await supabase.from('recurring_expenses').select('*');

 if (recurringData) setRecurringExpenses(recurringData);

 let expected = 0;
 let collected = 0;
 let count = 0;
 let expense = 0;

 if (invoices) {
 invoices.forEach(inv => {
 expected += Number(inv.amount);
 if (inv.status === 'paid') collected += Number(inv.amount);
 if (inv.status === 'pending') count += 1;
 });
 }
 
 // As per user requirement: expected revenue per year and collected will be same. 
 // We'll sync them for the display logic to zero out the deficit if required, but let's just use Collected.
 expected = collected; 

 if (payroll) {
 payroll.forEach(p => {
 expense += Number(p.final_net_pay || 0);
 });
 }
 if (recurringData) {
 recurringData.forEach(r => {
 expense += Number(r.amount || 0);
 });
 }

 setOverviewData({ totalExpected: expected, totalCollected: collected, pendingCount: count, payrollExpense: expense });
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
 setFetchingOverview(false);
 }
 };

 const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let qrUrl = paymentSettings.upi_qr_url;
      if (qrFile) {
        if (qrFile.size > 2 * 1024 * 1024) {
          throw new Error("File size must be under 2MB");
        }
        const fileExt = qrFile.name.split('.').pop();
        const fileName = `upi_qr_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, qrFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
        qrUrl = publicUrl;
      }

      const { data, error } = await supabase.from('payment_gateway_settings').upsert({
        id: paymentSettings.id || undefined,
        upi_id: paymentSettings.upi_id,
        upi_qr_url: qrUrl,
        bank_name: paymentSettings.bank_name,
        account_name: paymentSettings.account_name,
        account_number: paymentSettings.account_number,
        ifsc_code: paymentSettings.ifsc_code,
        updated_at: new Date()
      }).select().single();
      
      if (error) throw error;
      if (data) setPaymentSettings(data);
      setQrFile(null);
      if (window.erpToast) window.erpToast.show("Payment settings updated successfully", "success");
    } catch (err) {
      console.error(err);
      if (window.erpToast) window.erpToast.show(err.message || "Failed to update settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('fee_transactions')
        .select('*, profiles:student_id(full_name, erp_id, academic_batch, email, phone)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (data) {
         const groupMap = new Map();
         data.forEach(txn => {
           const dateKey = new Date(txn.created_at).toLocaleDateString('en-GB');
           const key = `${txn.student_id}_${txn.amount}_${dateKey}`;
           if (!groupMap.has(key)) {
              groupMap.set(key, {
                 ...txn,
                 is_merged: false,
                 merged_txns: [txn],
                 all_utrs: [txn.reference_number].filter(Boolean)
              });
           } else {
              const existing = groupMap.get(key);
              existing.is_merged = true;
              existing.merged_txns.push(txn);
              if (txn.reference_number && !existing.all_utrs.includes(txn.reference_number)) {
                 existing.all_utrs.push(txn.reference_number);
              }
           }
         });
         setPendingVerifications(Array.from(groupMap.values()));
      }
    } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally { setLoading(false); }
  };

 const fetchInvoiceHistory = async () => {
 setLoading(true);
 try {
 const { data } = await supabase
 .from('fee_invoices')
 .select('*, profiles:student_id(full_name, erp_id)')
 .order('created_at', { ascending: false })
 .limit(300);
 if (data) setInvoiceHistory(data);
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally { setLoading(false); }
 };

 const fetchBatches = async () => {
 try {
 const { data } = await supabase.from('profiles').select('academic_batch').eq('role', 'student');
 const distinctBatches = [...new Set(data.map(item => item.academic_batch).filter(Boolean))].sort();
 setBatches(distinctBatches);
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); }
 };

 const fetchBatchStudents = async (batchName) => {
 setLoading(true);
 setSelectedStudentIds([]);
 try {
 const { data } = await supabase
 .from('profiles')
 .select(`id, full_name, erp_id, academic_batch, email, phone, fee_invoices ( id, title, amount, status, due_date )`)
 .eq('academic_batch', batchName)
 .eq('role', 'student');
 if (data) {
   setStudents(data);
   const uniqueInvoicesMap = new Map();
   data.forEach(s => {
     (s.fee_invoices || []).forEach(inv => {
       const key = `${inv.title}-${inv.amount}`;
       if (!uniqueInvoicesMap.has(key)) {
         uniqueInvoicesMap.set(key, { ...inv, count: 1 });
       } else {
         uniqueInvoicesMap.get(key).count++;
       }
     });
   });
   setBatchHistory(Array.from(uniqueInvoicesMap.values()).sort((a,b) => new Date(b.due_date) - new Date(a.due_date)));
 }
 } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally { setLoading(false); }
 };

 // ================== ACTIONS ==================
   const handleConfirmPayment = async (txn) => {
  setIsVerifying(true);
  try {
  const txnIds = txn.merged_txns ? txn.merged_txns.map(t => t.id) : [txn.id];
  const { error: tErr } = await supabase.from('fee_transactions').update({ status: 'successful' }).in('id', txnIds);
  if (tErr) throw new Error("Transaction Error: " + tErr.message);

  const { error: iErr } = await supabase.from('fee_invoices').update({ status: 'paid' }).eq('student_id', txn.student_id).eq('status', 'under_verification');
  if (iErr) throw new Error("Invoice Error: " + iErr.message);
  
  setCurrentTxnPayload(txn);
  
  // Close modal and update UI immediately
  fetchVerifications();
  if(window.erpToast) window.erpToast.show(`Payment Verified! Dispatched receipts to ${txn.profiles?.full_name}`, "success");
  
  // Background processing for PDF and Comms
  setTimeout(async () => {
    // 1. WhatsApp Dispatch (Fast & Reliable)
    try {
      if (txn.profiles?.phone) {
         const utrs = txn.is_merged ? (txn.all_utrs.join(', ') || 'N/A') : (txn.reference_number || txn.id);
         await supabase.from('whatsapp_queue').insert({
            phone: txn.profiles.phone,
            message: `*✅ PAYMENT SUCCESSFUL*\n\nDear ${txn.profiles?.full_name || 'Student'},\nWe have successfully received and verified your payment of *₹${txn.amount}*.\n\nTransaction ID/UTR: ${utrs}\nDate: ${new Date().toLocaleDateString('en-GB')}\n\nYour official receipt has been sent to your email and is also available in your Student Portal.\n\n_This is an automated finance update._`,
            status: 'PENDING',
            recipient_name: txn.profiles?.full_name || 'Student'
         });
      }
    } catch (waErr) { console.error("WhatsApp dispatch error:", waErr); }

    // 2. Email & PDF Generation (Slower)
    try {
      let base64Pdf = null;
      if (luxuryInvoiceRef.current) {
        base64Pdf = await generateComponentPDF(luxuryInvoiceRef.current, `Invoice_${txn.id}.pdf`, {
          format: 'a4',
          orientation: 'portrait',
          returnBase64: true,
          scale: 1
        });
        
        await sendSystemEmail('FEE_PAYMENT_RECEIPT', {
          to_email: txn.profiles?.email || 'marvelswaroop118@gmail.com',
          student_name: txn.profiles?.full_name || 'Student',
          amount: txn.amount,
          fee_type: txn.purpose || 'Fee Payment',
          attachments: [
            {
              filename: `Fee_Receipt_${txn.id}.pdf`,
              content: base64Pdf,
              encoding: 'base64'
            }
          ]
        });
      }
    } catch(emailErr) { console.error("Email processing error:", emailErr); }
  }, 100);
  } catch (err) { 
    console.error("Confirmation Error:", err); 
    if (window.erpToast) window.erpToast.show(err.message || "An error occurred. Please try again.", "error"); 
  } finally { 
  setIsVerifying(false); 
  setCurrentTxnPayload(null);
  }
  };

  const handleBulkMarkPaid = async () => {
 if (!selectedStudentIds.length) return;
 setLoading(true);
 try {
 for (const id of selectedStudentIds) {
 await supabase.from('fee_invoices').update({ status: 'paid' }).eq('student_id', id).eq('status', 'pending');
 }
 setSelectedStudentIds([]);
 fetchBatchStudents(selectedBatch);
 if(window.erpToast) window.erpToast.show("Bulk Marked Paid successfully.", "success");
 } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally { setLoading(false); }
 };

 const handleClearAllInvoices = async (historyItem) => {
   if (!historyItem || !students.length) return;
   const pendingStudents = students.filter(s => s.fee_invoices?.some(i => i.title === historyItem.title && i.status === 'pending'));
   if (pendingStudents.length === 0) {
     if (window.erpToast) window.erpToast.show("All invoices for this fee are already cleared.", "info");
     return;
   }
   const confirmed = window.confirm(`Clear all ${pendingStudents.length} pending "${historyItem.title}" invoices for batch ${selectedBatch}?\n\nThis will mark them as paid and send receipt notifications to each student.`);
   if (!confirmed) return;

   setLoading(true);
   let successCount = 0;
   let failCount = 0;
   try {
     for (const s of pendingStudents) {
       const inv = s.fee_invoices.find(i => i.title === historyItem.title && i.status === 'pending');
       if (!inv) continue;
       try {
         const { error } = await supabase.from('fee_invoices').update({ status: 'paid' }).eq('id', inv.id);
         if (error) throw error;

         // Queue WhatsApp notification
         await supabase.from('whatsapp_queue').insert({
           phone: s.phone,
           message: `✅ *Fee Payment Cleared*\n\nDear ${s.full_name},\nYour payment of *₹${Number(inv.amount).toLocaleString('en-IN')}* for *${inv.title}* has been cleared by the Finance Department.\n\nYou can download your official receipt from the ERP Finance Hub.\n\n— Accounts Dept, Prudentia College of Law`,
           status: 'PENDING',
           recipient_name: s.full_name,
         });

         // Queue Email notification
         if (s.email) {
           try {
             await sendSystemEmail('FEE_PAYMENT_RECEIPT', {
               to_email: s.email,
               student_name: s.full_name,
               amount: Number(inv.amount).toLocaleString('en-IN'),
               fee_type: inv.title,
             });
           } catch (emailErr) { console.error(`Email failed for ${s.full_name}:`, emailErr); }
         }
         successCount++;
       } catch (studentErr) {
         console.error(`Failed to clear invoice for ${s.full_name}:`, studentErr);
         failCount++;
       }
     }
     fetchBatchStudents(selectedBatch);
     if (window.erpToast) {
       window.erpToast.show(`${successCount} invoices cleared successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}`, successCount > 0 ? 'success' : 'error');
     }
   } catch (err) {
     console.error(err);
     if (window.erpToast) window.erpToast.show("An error occurred during bulk clearing.", "error");
   } finally { setLoading(false); }
 };

 const handleAssignFee = async (e) => {
  e.preventDefault();
  if (!selectedBatch) return;
  setLoading(true);
  try {
    const inserts = students.map(s => {
      const finalAmount = customAmounts[s.id] !== undefined ? customAmounts[s.id] : assignAmount;
      return {
        student_id: s.id,
        title: assignTitle,
        amount: finalAmount,
        due_date: assignDueDate,
        status: 'pending'
      };
    });
    const { error } = await supabase.from('fee_invoices').insert(inserts);
    if (error) throw error;
    
    // UI SUCCESS: Instant response
    if (window.erpToast) window.erpToast.show(`Fee Invoice raised for ${students.length} students.`, "success");
    setAssignTitle('');
    setAssignAmount('');
    setAssignDueDate('');
    fetchBatchStudents(selectedBatch);
    setLoading(false); // Stop loading spinner immediately
    
    // BACKGROUND: Notifications & Comms
    setTimeout(async () => {
      try {
      // 1. In-App Notifications
      const notifs = students.map(s => ({
        recipient_id: s.id,
        title: 'New Fee Invoice',
        message: `An invoice for "${assignTitle}" has been raised. Due Date: ${new Date(assignDueDate).toLocaleDateString()}.`,
        type: 'finance',
        action_link: 'finance'
      }));
      await supabase.from('notifications').insert(notifs);

      // 2. WhatsApp Batch Broadcast (Send to Group)
      try {
        const { data: batchData } = await supabase.from('academic_batches').select('whatsapp_group_id').eq('name', selectedBatch).single();
        
        if (batchData && batchData.whatsapp_group_id) {
           const tplMsg = `📢 *FEE PAYMENT REMINDER*\nBatch: ${selectedBatch}\n\nDear Students & Parents,\nThis is an automated notification from the Finance Department.\nA new fee invoice (*${assignTitle}*) of *₹${Number(assignAmount).toLocaleString('en-IN')}* has been raised for your batch.\n\n📅 *Due Date:* ${new Date(assignDueDate).toLocaleDateString('en-GB')}\n\nPlease log in to your ERP portals at your earliest convenience to complete the payment and avoid any late penalties.\nIf your portal shows custom adjustments (e.g., scholarships), please pay the adjusted amount shown in your dashboard.\n\n— Accounts Dept, Prudentia College of Law`;
           
           await supabase.from('whatsapp_queue').insert({
              phone: batchData.whatsapp_group_id, // Group JID
              message: tplMsg,
              status: 'PENDING',
              recipient_name: `${selectedBatch} Group`,
              template_id: 'FEE_REMINDER_GROUP'
           });
        }
      } catch (waErr) {
        console.error("Failed to queue WhatsApp Group message", waErr);
      }

      // 3. Email Broadcast (Concurrent)
      try {
        const emailPromises = students.map(student => {
          if (!student.email) return Promise.resolve();
          const finalAmount = customAmounts[student.id] !== undefined ? customAmounts[student.id] : assignAmount;
          
          return sendSystemEmail('FEE_INVOICE_RAISED', {
            to_email: student.email,
            student_name: student.full_name,
            invoice_title: assignTitle,
            amount: finalAmount,
            due_date: new Date(assignDueDate).toLocaleDateString(),
            portal_link: window.location.origin + '/student/finance'
          });
        });
        
        await Promise.allSettled(emailPromises);
      } catch (emailErr) {
        console.error("Failed to broadcast emails", emailErr);
      }

      } catch(commErr) {
        console.error("Comms failed, but invoice was created", commErr);
      }
    }, 100);
  } catch (err) { console.error(err); if (window.erpToast) window.erpToast.show(err.message || "An error occurred.", "error"); setLoading(false); }
};

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

 return (
 <div className="min-h-screen bg-themeApp text-themeText ">
 {!isEmbedded && <PageHeader icon="fa-solid fa-coins" title="Finance Ledger" subtitle="Master finance control center." />}
 
 <div className="px-4 lg:px-8 py-6 w-full mx-auto animate-fade-in">
 
 {/* TABS */}
  <div className="flex flex-col gap-3 mb-8 w-full max-w-full">
  
    {/* Student Receivables Row */}
    <div className="flex flex-nowrap items-center gap-2 md:gap-4 bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl p-2 rounded-2xl border border-themeBorder dark:border-white/[0.08] w-full max-w-full overflow-x-auto custom-scrollbar shrink-0">
      <div className="flex items-center gap-2 pr-4 border-r border-themeBorder shrink-0">
        <div className="px-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec/40 block leading-tight">Student</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-themeText block leading-tight">Receivables</span>
        </div>
      </div>
      {[
        { id: 'overview', label: 'Institutional P&L', icon: 'fa-vault' },
        { id: 'verifications', label: 'Pending Verifications', icon: 'fa-money-check-pen' },
        { id: 'batch', label: 'Batch Manager', icon: 'fa-users-rectangle' },
        { id: 'invoice_history', label: 'Invoice History', icon: 'fa-file-invoice' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center shrink-0 gap-2 ${
            activeTab === tab.id 
            ? 'bg-amber-500 text-themeText shadow-lg scale-100' 
            : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated scale-95 hover:scale-100'
          }`}
        >
          <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
        </button>
      ))}
    </div>

    {/* Faculty Payables Row */}
    <div className="flex flex-nowrap items-center gap-2 md:gap-4 bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl p-2 rounded-2xl border border-themeBorder dark:border-white/[0.08] w-full max-w-full overflow-x-auto custom-scrollbar shrink-0">
      <div className="flex items-center gap-2 pr-4 border-r border-themeBorder shrink-0">
        <div className="px-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec/40 block leading-tight">Faculty</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-themeText block leading-tight">Payables</span>
        </div>
      </div>
      {[
        { id: 'payroll', label: 'Payroll Automation', icon: 'fa-file-invoice-dollar' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center shrink-0 gap-2 ${
            activeTab === tab.id 
            ? 'bg-emerald-500 text-themeText shadow-lg scale-100' 
            : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated scale-95 hover:scale-100'
          }`}
        >
          <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
        </button>
      ))}
    </div>

    {/* General Config Row */}
    <div className="flex flex-nowrap items-center gap-2 md:gap-4 bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl p-2 rounded-2xl border border-themeBorder dark:border-white/[0.08] w-full max-w-full overflow-x-auto custom-scrollbar shrink-0">
      <div className="flex items-center gap-2 pr-4 border-r border-themeBorder shrink-0">
        <div className="px-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec/40 block leading-tight">General</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-themeText block leading-tight">Settings</span>
        </div>
      </div>
      {[
        { id: 'settings', label: 'Payment Config', icon: 'fa-gear' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center shrink-0 gap-2 ${
            activeTab === tab.id 
            ? 'bg-blue-500 text-white shadow-lg scale-100' 
            : 'text-themeTextSec hover:text-themeText hover:bg-themeElevated scale-95 hover:scale-100'
          }`}
        >
          <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
        </button>
      ))}
    </div>

  </div>

  {/* TAB 1: OVERVIEW */}
 {activeTab === 'overview' && (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {fetchingOverview ? (
 <div className="col-span-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
 ) : (
 <>
 <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg p-6 rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Expected Revenue (Yr)</p>
 <h2 className="text-2xl font-black text-themeText font-mono">{formatCurrency(overviewData.totalExpected)}</h2>
 </div>
 <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg p-6 rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Total Collected (Yr)</p>
 <h2 className="text-2xl font-black text-emerald-500 font-mono">{formatCurrency(overviewData.totalCollected)}</h2>
 </div>
 <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg p-6 rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Current Deficit</p>
 <h2 className="text-2xl font-black text-rose-500 font-mono">{formatCurrency(overviewData.totalExpected - overviewData.totalCollected)}</h2>
 </div>
 <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg p-6 rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mb-1">Total Monthly Exp.</p>
 <h2 className="text-2xl font-black text-purple-500 font-mono">{formatCurrency(overviewData.payrollExpense)}</h2>
 </div>
 </>
 )}
 </div>
 
 {/* RECURRING EXPENSES SECTION */}
 {!fetchingOverview && (
 <div className="mt-8 animate-fade-in">
 <h3 className="text-lg font-black text-themeText mb-4">Recurring Operations & Staff Payroll</h3>
 <div className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg rounded-2xl p-6">
 <form onSubmit={handleAddExpense} className="flex gap-4 items-end mb-6">
 <div className="flex-1">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Expense/Staff Role Title</label>
 <input type="text" required value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value})} placeholder="e.g. Non-Teaching Staff, Electricity Bill" className="w-full bg-themeApp /20 border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-amber-500" />
 </div>
 <div className="w-48">
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Monthly Amount (₹)</label>
 <input type="number" required value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value})} placeholder="Amount" className="w-full bg-themeApp /20 border border-themeBorder rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-amber-500" />
 </div>
 <button type="submit" className="h-[46px] px-6 bg-amber-500 hover:bg-amber-600 text-themeApp font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
 <i className="fa-solid fa-plus"></i> Add
 </button>
 </form>
 
 <div className="flex flex-col gap-2">
 {recurringExpenses.length === 0 ? (
 <p className="text-sm font-bold text-themeTextSec py-4 text-center">No recurring staff payroll or expenses added yet.</p>
 ) : (
 recurringExpenses.map(exp => (
 <div key={exp.id} className="flex justify-between items-center bg-themeApp border border-themeBorder rounded-xl p-4">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
 <i className="fa-solid fa-money-bills"></i>
 </div>
 <div>
 <h4 className="text-sm font-bold text-themeText ">{exp.title}</h4>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Monthly Deduction</p>
 </div>
 </div>
 <div className="flex items-center gap-6">
 <span className="text-base font-black text-rose-500 font-mono">-{formatCurrency(exp.amount)}</span>
 <HoldButton size="sm" onHold={() => handleRemoveExpense(exp.id)} radius={8} backgroundColor="rgba(244,63,94,0.1)" fillColor="#f43f5e" textColor="#f43f5e" doneLabel="Deleted" icon={<HugeiconsIcon icon={Delete02Icon} size={16} />}>
 null
 </HoldButton>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 )}
 </>
 )}

 {/* TAB 2: VERIFICATIONS */}
 {activeTab === 'verifications' && (
 <div className="flex flex-col gap-4">
 <h3 className="text-lg font-black text-themeText ">Pending Clearances</h3>
 {loading ? (
 <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
 ) : pendingVerifications.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
 <i className="fa-solid fa-check-double text-2xl"></i>
 </div>
 <h4 className="text-themeText font-black text-sm">All Clear!</h4>
 <p className="text-themeTextSec text-xs font-bold mt-1 max-w-sm text-center">There are no pending fee verifications at the moment. You're all caught up.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {pendingVerifications.map(txn => (
 <div key={txn.id} onClick={() => setSelectedVerificationDetail(txn)} className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg rounded-2xl p-5 flex flex-col gap-4 cursor-pointer hover:border-amber-500/30 hover:shadow-amber-500/10 transition-all">
 <div className="flex justify-between items-start">
 <div>
 <h4 className="text-sm font-black text-themeText ">{txn.profiles?.full_name}</h4>
 <p className="text-[10px] font-bold text-themeTextSec uppercase">{txn.profiles?.academic_batch}</p>
 </div>
 <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase rounded-md border border-amber-500/20">Pending</span>
 </div>
 <div className="bg-themeElevated dark:bg-themeApp rounded-xl p-3 border border-themeBorder dark:border-white/[0.08]">
 <div className="flex justify-between items-center mb-1">
 <span className="text-[10px] font-bold text-themeTextSec ">Amount</span>
 <span className="text-xs font-black text-themeText font-mono">₹{txn.amount}</span>
 </div>
 <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-themeTextSec ">UTR / Ref ID</span>
                        <span className="text-[10px] font-medium text-themeText truncate max-w-[150px]" title={txn.is_merged ? (txn.all_utrs.join(", ") || "N/A") : (txn.reference_number || "N/A")}>
                          {txn.is_merged ? (txn.all_utrs.join(", ") || "N/A") : (txn.reference_number || "N/A")}
                        </span>
                      </div>
                      {txn.is_merged && (
                        <div className="mt-2 pt-2 border-t border-themeBorder dark:border-white/[0.08] flex justify-between items-center">
                          <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest"><i className="fa-solid fa-code-merge mr-1"></i>Merged Duplicates ({txn.merged_txns.length})</span>
                        </div>
                      )}
 </div>
 <div className="flex items-center justify-between gap-2">
 <span className="text-[9px] font-bold text-themeTextSec">{new Date(txn.created_at).toLocaleDateString('en-GB')} · {new Date(txn.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
 <button 
 onClick={(e) => { e.stopPropagation(); handleConfirmPayment(txn); }}
 disabled={isVerifying}
 className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-themeText text-emerald-500 rounded-xl text-xs font-black transition-colors flex justify-center items-center gap-2"
 >
 <i className="fa-solid fa-check"></i> Verify & Send Receipt
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* TAB 3: BATCH MANAGER */}
 {activeTab === 'batch' && (
 selectedHistoryItem ? (
 <div className="flex flex-col gap-6 animate-fade-in">
 <div className="flex justify-between items-center bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl p-4 rounded-2xl border border-themeBorder dark:border-white/[0.08]">
 <div className="flex items-center gap-4">
 <button onClick={() => setSelectedHistoryItem(null)} className="w-10 h-10 rounded-full bg-themeElevated flex items-center justify-center hover:bg-themePanel/10 transition-colors text-themeTextSec border border-themeBorder"><i className="fa-solid fa-arrow-left"></i></button>
 <div>
 <h2 className="text-sm font-black text-themeText tracking-tight">{selectedHistoryItem.title} - {selectedBatch}</h2>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">Assigned to {selectedHistoryItem.count} Students</p>
 </div>
 </div>
 <button
   onClick={() => handleClearAllInvoices(selectedHistoryItem)}
   disabled={loading}
   className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/30 hover:border-emerald-500 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
 >
   <i className="fa-solid fa-check-double"></i>
   {loading ? 'Clearing...' : 'Clear All Receipts'}
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {students.filter(s => s.fee_invoices?.some(i => i.title === selectedHistoryItem.title)).map(s => {
 const inv = s.fee_invoices.find(i => i.title === selectedHistoryItem.title);
 return (
 <div key={s.id} className="bg-themePanel/80 backdrop-blur-xl border border-themeBorder rounded-2xl p-4 flex flex-col gap-2 transition-colors hover:bg-themePanel/5">
 <div>
 <h4 className="text-sm font-black text-themeText">{s.full_name}</h4>
 <p className="text-[10px] font-bold text-themeTextSec">{s.erp_id}</p>
 </div>
 <div className="mt-2 pt-3 border-t border-themeBorder flex items-center justify-between">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest"><i className="fa-solid fa-coins mr-1 text-amber-500"></i> Amount</span>
 <span className="text-xs font-black text-amber-500 font-mono">₹{Number(inv.amount).toLocaleString('en-IN')}</span>
 </div>
 <div className="flex items-center justify-between mt-1">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Status</span>
 <span className={`text-[10px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{inv.status}</span>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 ) : (
 <div className="flex flex-col xl:flex-row gap-6">
 {/* Left: List & Bulk Actions */}
 <div className="flex-1 flex flex-col gap-4">
 <div className="flex justify-between items-center bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl p-4 rounded-2xl border border-themeBorder dark:border-white/[0.08] mb-4">
 <h2 className="text-sm font-black text-themeText tracking-tight">
   {selectedBatch ? `Batch: ${selectedBatch}` : "Select a batch from the panel"}
 </h2>
 {selectedStudentIds.length > 0 && (
 <button onClick={handleBulkMarkPaid} className="bg-emerald-500 text-themeText px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
 Mark {selectedStudentIds.length} Paid
 </button>
 )}
 </div>

 { loading ? (
 <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
 ) : !selectedBatch ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <div className="w-16 h-16 rounded-full bg-themePanel/5 flex items-center justify-center text-themeTextSec/50 /20 mb-4 border border-themeBorder dark:border-white/[0.08]">
 <i className="fa-solid fa-layer-group text-2xl"></i>
 </div>
 <h4 className="text-themeText font-black text-sm">Select a Batch</h4>
 <p className="text-themeTextSec text-xs font-bold mt-1">Choose an academic batch from the dropdown above to view students and assign fees.</p>
 </div>
 ) : students.length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <div className="w-16 h-16 rounded-full bg-themePanel/5 flex items-center justify-center text-themeTextSec/50 /20 mb-4 border border-themeBorder dark:border-white/[0.08]">
 <i className="fa-solid fa-users-slash text-2xl"></i>
 </div>
 <h4 className="text-themeText font-black text-sm">No Students Found</h4>
 <p className="text-themeTextSec text-xs font-bold mt-1">There are no students enrolled in {selectedBatch}.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-4">
 {batchHistory.length > 0 && (
   <div className="bg-themePanel/5 border border-themeBorder rounded-2xl p-4 mb-2">
     <h3 className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-3"><i className="fa-solid fa-clock-rotate-left mr-1"></i> Previously Assigned to Batch</h3>
     <div className="flex flex-wrap gap-2">
       {batchHistory.map(h => (
         <div key={`${h.title}-${h.amount}`} className="bg-themeElevated px-3 py-2 rounded-xl flex items-center gap-3 border border-themeBorder">
           <div className="cursor-pointer" onClick={() => setSelectedHistoryItem(h)}>
             <p className="text-xs font-black text-themeText">{h.title}</p>
             <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">{h.count} students</p>
           </div>
           <div className="text-right pl-3 border-l border-themeBorder">
             <p className="text-xs font-black text-amber-500 font-mono">₹{Number(h.amount).toLocaleString('en-IN')}</p>
             <p className="text-[9px] font-bold text-themeTextSec">{h.due_date}</p>
           </div>
           <button onClick={() => handleClearAllInvoices(h)} disabled={loading} className="ml-1 w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 flex items-center justify-center transition-all duration-300 disabled:opacity-50 shrink-0" title="Clear All Receipts"><i className="fa-solid fa-check-double text-[10px]"></i></button>
         </div>
       ))}
     </div>
   </div>
 )}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {students.map(s => {
 const pendingInv = s.fee_invoices?.filter(i => i.status === 'pending') || [];
 const isSelected = selectedStudentIds.includes(s.id);
 return (
 <div 
 key={s.id} 
 className={`bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border ${isSelected ? 'border-emerald-500' : 'border-themeBorder '} rounded-2xl p-4 flex flex-col gap-2 transition-colors hover:bg-themePanel/5`}
 >
 <div className="flex justify-between items-start cursor-pointer" onClick={() => pendingInv.length > 0 && setSelectedStudentIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])}>
 <div>
 <h4 className="text-sm font-black text-themeText ">{s.full_name}</h4>
 <p className="text-[10px] font-bold text-themeTextSec ">{s.erp_id}</p>
 </div>
 <div className="text-right">
 {pendingInv.length > 0 ? (
 <span className="text-xs font-black text-rose-500 font-mono">Dues: ₹{pendingInv.reduce((a,b)=>a+Number(b.amount),0)}</span>
 ) : (
 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle"></i> Clear</span>
 )}
 </div>
 </div>
 
 {/* Adjust / Scholarship Override */}
 {assignAmount && pendingInv.length === 0 && (
 <div className="mt-2 pt-3 border-t border-themeBorder flex items-center justify-between gap-2">
 <span className="text-[9px] font-bold text-themeTextSec /40 uppercase tracking-widest"><i className="fa-solid fa-tags text-amber-500"></i> Exception</span>
 <input 
 type="number" 
 placeholder={`Default: ₹${assignAmount}`}
 value={customAmounts[s.id] !== undefined ? customAmounts[s.id] : ''}
 onChange={(e) => {
 const val = e.target.value;
 setCustomAmounts(prev => {
 const next = {...prev};
 if (val === '') delete next[s.id];
 else next[s.id] = val;
 return next;
 });
 }}
 className="bg-themeElevated border border-themeBorder rounded-lg px-2 py-1.5 text-xs font-mono font-black w-24 outline-none focus:border-amber-500 text-themeText "
 />
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 )}
 </div>

 {/* Right: Assign Fee Form */}
 <div className="w-full xl:w-96 bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg rounded-2xl p-6 h-fit shrink-0">
 <h3 className="text-sm font-black text-themeText uppercase tracking-widest mb-6">Assign Bulk Fee</h3>
 <form onSubmit={handleAssignFee} className="flex flex-col gap-4">
 <div>
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Target Batch</label>
 <select required value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-amber-500 appearance-none">
 <option value="" disabled>Choose a batch...</option>
 {batches.map(b => <option key={b} value={b}>{b}</option>)}
 </select>
 </div>
 <div>
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Fee Title</label>
 <input type="text" required value={assignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="e.g. Sem 4 Tuition" className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-amber-500" />
 </div>
 <div>
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Amount (₹)</label>
 <input type="text" required value={assignAmount ? Number(assignAmount).toLocaleString('en-IN') : ''} onChange={e => setAssignAmount(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-amber-500" />
 </div>
 <div>
 <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Due Date</label>
 <input type="date" required value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-amber-500" />
 </div>
 <button type="submit" disabled={!selectedBatch || loading} className="w-full mt-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-themeText rounded-xl text-xs font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
 Deploy to {selectedBatch || 'Batch'}
 </button>
 </form>
 </div>
 </div>
 )
 )}

 {/* TAB 4: INVOICE HISTORY */}
 {activeTab === 'invoice_history' && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {loading ? (
 <div className="col-span-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
 ) : (
 <>
 {/* Pending List */}
 <div className="flex flex-col gap-4">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
 <h3 className="text-sm font-black text-themeText uppercase tracking-widest">Pending Dues (Requires Follow-up)</h3>
 </div>
 <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
 {invoiceHistory.filter(i => i.status === 'pending').length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-file-invoice text-themeTextSec/50 /20 text-xl mb-3"></i>
 <p className="text-themeTextSec text-xs font-bold">No pending dues found.</p>
 </div>
 ) : invoiceHistory.filter(i => i.status === 'pending').map(inv => (
 <div key={inv.id} className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg rounded-xl p-4 flex justify-between items-center">
 <div>
 <h4 className="text-sm font-black text-themeText ">{inv.profiles?.full_name}</h4>
 <p className="text-[10px] font-bold text-themeTextSec ">{inv.title}</p>
 </div>
 <div className="text-right">
 <span className="text-sm font-black text-rose-500 font-mono">₹{inv.amount}</span>
 <p className="text-[9px] font-bold text-rose-500/50 uppercase tracking-widest">Due {new Date(inv.due_date).toLocaleDateString()}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Cleared List */}
 <div className="flex flex-col gap-4">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
 <h3 className="text-sm font-black text-themeText uppercase tracking-widest">Cleared & Sent</h3>
 </div>
 <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
 {invoiceHistory.filter(i => i.status === 'paid' || i.status === 'successful').length === 0 ? (
 <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeElevated backdrop-blur-2xl border-2 border-dashed border-themeBorder rounded-[2rem] text-center px-4">
 <i className="fa-solid fa-receipt text-themeTextSec/50 /20 text-xl mb-3"></i>
 <p className="text-themeTextSec text-xs font-bold">No cleared invoices yet.</p>
 </div>
 ) : invoiceHistory.filter(i => i.status === 'paid' || i.status === 'successful').map(inv => (
 <div key={inv.id} className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg rounded-xl p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
 <div>
 <h4 className="text-sm font-black text-themeText ">{inv.profiles?.full_name}</h4>
 <p className="text-[10px] font-bold text-themeTextSec ">{inv.title}</p>
 </div>
 <div className="flex items-center gap-3">
 <span className="text-sm font-black text-emerald-500 font-mono">₹{inv.amount}</span>
 <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
 <i className="fa-solid fa-check text-[10px]"></i>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </>
 )}
 </div>
 )}

 {/* TAB 5: PAYROLL AUTOMATION */}
 {activeTab === 'payroll' && (
 <AdminPayroll />
 )}

 </div>
 
 
  {/* TAB 6: PAYMENT CONFIG */}
  {activeTab === 'settings' && (
    <div className="max-w-6xl animate-fade-in mx-auto mt-4">
      <h2 className="text-lg lg:text-3xl font-black text-themeText tracking-tight mb-1 lg:mb-2">Payment Gateway Config</h2>
      <p className="text-[10px] lg:text-sm font-bold text-themeTextSec uppercase tracking-widest mb-6 lg:mb-10 leading-relaxed">Update the college bank and UPI details shown to students during checkout.</p>
      
      <form onSubmit={handleSavePaymentSettings} className="bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-xl border border-themeBorder dark:border-white/[0.08] shadow-lg rounded-3xl p-5 sm:p-6 lg:p-10 relative shadow-xl mb-24 lg:mb-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* PANE 1: BANK */}
          <div>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-themeBorder dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <i className="fa-solid fa-building-columns text-lg"></i>
              </div>
              <h3 className="text-xl font-black text-themeText">Bank Account</h3>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Bank Name</label>
                <input type="text" value={paymentSettings?.bank_name || ''} onChange={(e) => setPaymentSettings({...paymentSettings, bank_name: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-amber-500 transition-colors" required placeholder="e.g. ICICI Bank" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Account Name</label>
                <input type="text" value={paymentSettings?.account_name || ''} onChange={(e) => setPaymentSettings({...paymentSettings, account_name: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText outline-none focus:border-amber-500 transition-colors" required placeholder="e.g. PRUDENTIA COLLEGE OF LAW" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">Account Number</label>
                  <input type="text" value={paymentSettings?.account_number || ''} onChange={(e) => setPaymentSettings({...paymentSettings, account_number: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-black font-mono text-themeText outline-none focus:border-amber-500 transition-colors" required placeholder="024305013005" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">IFSC Code</label>
                  <input type="text" value={paymentSettings?.ifsc_code || ''} onChange={(e) => setPaymentSettings({...paymentSettings, ifsc_code: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-black font-mono text-themeText outline-none focus:border-amber-500 transition-colors" required placeholder="ICIC0000243" />
                </div>
              </div>
            </div>
          </div>

          {/* PANE 2: UPI */}
          <div className="lg:border-l lg:border-themeBorder dark:border-white/[0.08] lg:pl-16">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-themeBorder dark:border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <i className="fa-brands fa-google-pay text-lg"></i>
              </div>
              <h3 className="text-xl font-black text-themeText">UPI Integration</h3>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2">College UPI ID</label>
                <input type="text" value={paymentSettings?.upi_id || ''} onChange={(e) => setPaymentSettings({...paymentSettings, upi_id: e.target.value})} className="w-full bg-themeElevated border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-black font-mono text-themeText outline-none focus:border-emerald-500 transition-colors" required placeholder="college@bank" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-2 flex justify-between">
                  <span>Upload QR Code (Max 2MB)</span>
                  {paymentSettings?.upi_qr_url && <span className="text-emerald-500"><i className="fa-solid fa-circle-check"></i> Active</span>}
                </label>
                <div className="w-full flex items-center gap-4">
                  {(qrFile || paymentSettings?.upi_qr_url) && (
                    <img src={qrFile ? URL.createObjectURL(qrFile) : paymentSettings.upi_qr_url} alt="QR Preview" className="w-16 h-16 rounded-lg object-cover bg-white p-1 border border-emerald-500 shadow-sm" />
                  )}
                  <div className="flex-1 relative">
                    <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full bg-themeElevated border border-dashed border-themeBorder hover:border-emerald-500/50 rounded-xl px-4 py-4 flex flex-col items-center justify-center transition-colors">
                      <i className="fa-solid fa-cloud-arrow-up text-xl text-themeTextSec mb-2"></i>
                      <span className="text-xs font-bold text-themeText">{qrFile ? qrFile.name : 'Click or drag to upload QR'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-12 pt-8 border-t border-themeBorder dark:border-white/[0.08]">
          <button type="submit" disabled={loading} className="py-4 px-10 bg-themeText text-themeApp hover:bg-amber-500 hover:text-white rounded-2xl text-sm font-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl hover:shadow-amber-500/25 hover:-translate-y-1">
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Configuration
          </button>
        </div>

      </form>
    </div>
  )}
  {/* Verification Detail Modal */}
  {selectedVerificationDetail && (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-themeApp border border-themeBorder w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up">
        <button onClick={() => setSelectedVerificationDetail(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-themeElevated flex items-center justify-center text-themeTextSec hover:bg-themePanel transition-colors z-10"><i className="fa-solid fa-xmark"></i></button>
        <div className="bg-amber-500/10 p-6 border-b border-themeBorder">
          <h2 className="text-lg font-black text-themeText tracking-tight mb-1">Transaction Details</h2>
          <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest">{selectedVerificationDetail.profiles?.full_name}</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Student ERP ID</label>
            <p className="text-sm font-black text-themeText font-mono">{selectedVerificationDetail.profiles?.erp_id || selectedVerificationDetail.student_id.split('-')[0] + '...'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Amount</label>
              <p className="text-base font-black text-emerald-500 font-mono">₹{selectedVerificationDetail.amount}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Date</label>
              <p className="text-sm font-black text-themeText">{new Date(selectedVerificationDetail.created_at).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">Time of Submission</label>
            <p className="text-sm font-black text-themeText">{new Date(selectedVerificationDetail.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest block mb-1">UTR / Ref IDs</label>
            <div className="bg-themeElevated p-3 rounded-xl border border-themeBorder">
              {selectedVerificationDetail.is_merged ? (
                selectedVerificationDetail.all_utrs.map((utr, idx) => (
                  <div key={idx} className="text-xs font-black text-themeText font-mono mb-1 last:mb-0">{utr}</div>
                ))
              ) : (
                <div className="text-xs font-black text-themeText font-mono">{selectedVerificationDetail.reference_number || "N/A"}</div>
              )}
            </div>
          </div>
          {selectedVerificationDetail.is_merged && (
             <div>
               <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1"><i className="fa-solid fa-code-merge mr-1"></i> Merged Items</label>
               <p className="text-xs font-bold text-themeTextSec">This groups {selectedVerificationDetail.merged_txns.length} pending submissions for the same user, amount, and date.</p>
             </div>
          )}
          <button 
            onClick={() => { setSelectedVerificationDetail(null); handleConfirmPayment(selectedVerificationDetail); }}
            disabled={isVerifying}
            className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-themeApp rounded-xl text-sm font-black transition-colors flex justify-center items-center gap-2 shadow-xl hover:-translate-y-0.5"
          >
            {isVerifying ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check-double"></i>} Verify & Approve
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Hidden Document Templates for PDF Generation */}
  <div className="absolute opacity-0 pointer-events-none -left-[9999px] -top-[9999px]">
  <FeeReceiptTemplate ref={luxuryInvoiceRef} invoiceData={currentTxnPayload} studentData={currentTxnPayload?.profiles} />
  </div>
 </div>
 );
}
