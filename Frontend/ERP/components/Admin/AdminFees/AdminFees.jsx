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

  // --- BATCH MANAGER STATE ---
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  const [assignTitle, setAssignTitle] = useState('');
  const [assignAmount, setAssignAmount] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  // --- INVOICE HISTORY STATE ---
  const [invoiceHistory, setInvoiceHistory] = useState([]);

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
    } catch (err) {
        console.error(err);
        alert('Failed to add expense.');
    }
  };
  
  const handleRemoveExpense = async (id) => {
      try {
          const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
          if (error) throw error;
          fetchOverview();
      } catch (err) {
          console.error(err);
      }
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
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingOverview(false);
    }
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('fee_transactions')
        .select('*, profiles:student_id(full_name, academic_batch)')
        .eq('status', 'pending');
      if (data) setPendingVerifications(data);
    } catch (err) {} finally { setLoading(false); }
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
    } catch (e) {} finally { setLoading(false); }
  };

  const fetchBatches = async () => {
    try {
      const { data } = await supabase.from('profiles').select('academic_batch').eq('role', 'student');
      const distinctBatches = [...new Set(data.map(item => item.academic_batch).filter(Boolean))].sort();
      setBatches(distinctBatches);
    } catch (err) {}
  };

  const fetchBatchStudents = async (batchName) => {
    setLoading(true);
    setSelectedStudentIds([]);
    try {
      const { data } = await supabase
        .from('profiles')
        .select(`id, full_name, erp_id, academic_batch, fee_invoices ( id, title, amount, status, due_date )`)
        .eq('academic_batch', batchName)
        .eq('role', 'student');
      if (data) setStudents(data);
    } catch (err) {} finally { setLoading(false); }
  };

  // ================== ACTIONS ==================
  const handleConfirmPayment = async (txn) => {
    setIsVerifying(true);
    try {
      await supabase.from('fee_transactions').update({ status: 'successful' }).eq('id', txn.id);
      await supabase.from('fee_invoices').update({ status: 'paid' }).eq('student_id', txn.student_id).eq('status', 'under_verification');
      
      setCurrentTxnPayload(txn);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (luxuryInvoiceRef.current) {
        // Generate PDF locked with Student Registration No (or ERP ID)
        const base64Pdf = await generateComponentPDF(luxuryInvoiceRef.current, `Invoice_${txn.id}.pdf`, {
            format: 'a4',
            orientation: 'portrait',
            returnBase64: true
        });
        
        await sendSystemEmail('APPLICATION_RECEIVED', {
            to_email: txn.profiles?.email || 'marvelswaroop118@gmail.com',
            subject: `Official Fee Invoice - ${txn.id}`,
            message_body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #111; letter-spacing: 1px;">PCL FINANCE DEPARTMENT</h2>
                    <p>Dear ${txn.profiles?.full_name},</p>
                    <p>Your payment of <strong>₹${txn.amount}</strong> has been successfully verified.</p>
                    <p>Please find your official encrypted tax invoice attached. It is protected with your ERP ID (<strong>${txn.profiles?.erp_id}</strong>).</p>
                    <br/>
                    <p style="font-size: 12px; color: #888;">This is an automated system message. Do not reply.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Fee_Invoice_${txn.id}.pdf`,
                    content: base64Pdf,
                    encoding: 'base64'
                }
            ]
        });
      }
      
      fetchVerifications();
      (window.erpDialog?.alert || alert)(`✅ Payment Confirmed & Locked PDF Sent to ${txn.profiles?.full_name}`);
    } catch (err) {
      console.error(err);
      (window.erpDialog?.alert || alert)('Failed to confirm payment.');
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
      (window.erpDialog?.alert || alert)('Bulk Marked Paid successfully.');
    } catch (e) {} finally { setLoading(false); }
  };

  const handleAssignFee = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const inserts = students.map(s => ({ student_id: s.id,
        title: assignTitle,
        amount: assignAmount,
        due_date: assignDueDate,
        status: 'pending'
      }));
      await supabase.from('fee_invoices').insert(inserts);
      setAssignTitle(''); setAssignAmount(''); setAssignDueDate('');
      fetchBatchStudents(selectedBatch);
      (window.erpDialog?.alert || alert)('Fee assigned to batch successfully.');
    } catch (err) {} finally { setLoading(false); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-themeText dark:text-white">
      {!isEmbedded && <PageHeader icon="fa-solid fa-coins" title="Finance Ledger" subtitle="Master finance control center." />}
      
      <div className="px-4 lg:px-8 py-6 w-full mx-auto animate-fade-in">
        
        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-2 rounded-2xl border border-black/[0.04] dark:border-white/[0.08] w-fit">
          {[
            { id: 'overview', label: 'Institutional P&L', icon: 'fa-vault' },
            { id: 'verifications', label: 'Pending Verifications', icon: 'fa-money-check-pen' },
            { id: 'batch', label: 'Batch Manager', icon: 'fa-users-rectangle' },
            { id: 'invoice_history', label: 'Invoice History', icon: 'fa-file-invoice' },
            { id: 'payroll', label: 'Payroll Automation', icon: 'fa-file-invoice-dollar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-black shadow-lg scale-100' 
                  : 'text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-white/5 scale-95 hover:scale-100'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fetchingOverview ? (
              <div className="col-span-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <>
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest mb-1">Expected Revenue (Yr)</p>
                  <h2 className="text-2xl font-black text-themeText dark:text-white font-mono">{formatCurrency(overviewData.totalExpected)}</h2>
                </div>
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest mb-1">Total Collected (Yr)</p>
                  <h2 className="text-2xl font-black text-emerald-500 font-mono">{formatCurrency(overviewData.totalCollected)}</h2>
                </div>
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest mb-1">Current Deficit</p>
                  <h2 className="text-2xl font-black text-rose-500 font-mono">{formatCurrency(overviewData.totalExpected - overviewData.totalCollected)}</h2>
                </div>
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                  <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest mb-1">Total Monthly Exp.</p>
                  <h2 className="text-2xl font-black text-purple-500 font-mono">{formatCurrency(overviewData.payrollExpense)}</h2>
                </div>
              </>
            )}
          </div>
          
          {/* RECURRING EXPENSES SECTION */}
          {!fetchingOverview && (
              <div className="mt-8 animate-fade-in">
                <h3 className="text-lg font-black text-themeText dark:text-white mb-4">Recurring Operations & Staff Payroll</h3>
                <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-6">
                    <form onSubmit={handleAddExpense} className="flex gap-4 items-end mb-6">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Expense/Staff Role Title</label>
                            <input type="text" required value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value})} placeholder="e.g. Non-Teaching Staff, Electricity Bill" className="w-full bg-gray-50 dark:bg-black/20 border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                        </div>
                        <div className="w-48">
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Monthly Amount (₹)</label>
                            <input type="number" required value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value})} placeholder="Amount" className="w-full bg-gray-50 dark:bg-black/20 border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                        </div>
                        <button type="submit" className="h-[46px] px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                            <i className="fa-solid fa-plus"></i> Add
                        </button>
                    </form>
                    
                    <div className="flex flex-col gap-2">
                        {recurringExpenses.length === 0 ? (
                            <p className="text-sm font-bold text-themeTextSec py-4 text-center">No recurring staff payroll or expenses added yet.</p>
                        ) : (
                            recurringExpenses.map(exp => (
                                <div key={exp.id} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 border border-themeBorder dark:border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                                            <i className="fa-solid fa-money-bills"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-themeText dark:text-white">{exp.title}</h4>
                                            <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Monthly Deduction</p>
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
            <h3 className="text-lg font-black text-themeText dark:text-white">Pending Clearances</h3>
            {loading ? (
              <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : pendingVerifications.length === 0 ? (
              <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                  <i className="fa-solid fa-check-double text-2xl"></i>
                </div>
                <h4 className="text-themeText dark:text-white font-black text-sm">All Clear!</h4>
                <p className="text-themeTextSec dark:text-white/50 text-xs font-bold mt-1 max-w-sm text-center">There are no pending fee verifications at the moment. You're all caught up.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingVerifications.map(txn => (
                  <div key={txn.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-themeText dark:text-white">{txn.profiles?.full_name}</h4>
                        <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase">{txn.profiles?.academic_batch}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase rounded-md border border-amber-500/20">Pending</span>
                    </div>
                    <div className="bg-black/5 dark:bg-themeApp rounded-xl p-3 border border-black/[0.04] dark:border-white/[0.08]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50">Amount</span>
                        <span className="text-xs font-black text-themeText dark:text-white font-mono">₹{txn.amount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50">Ref ID</span>
                        <span className="text-[10px] font-medium text-white/80">{txn.transaction_id}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConfirmPayment(txn)}
                      disabled={isVerifying}
                      className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-500 rounded-xl text-xs font-black transition-colors flex justify-center items-center gap-2"
                    >
                      <i className="fa-solid fa-check"></i> Verify & Send Receipt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BATCH MANAGER */}
        {activeTab === 'batch' && (
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Left: List & Bulk Actions */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] p-2 pr-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.08]">
                <select 
                  value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
                  className="bg-transparent text-sm font-bold text-themeText dark:text-white px-4 py-2 outline-none w-64 appearance-none"
                >
                  <option value="" disabled>Select Academic Batch</option>
                  {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {selectedStudentIds.length > 0 && (
                  <button onClick={handleBulkMarkPaid} className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">
                    Mark {selectedStudentIds.length} Paid
                  </button>
                )}
              </div>

              { loading ? (
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : !selectedBatch ? (
                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-300 dark:text-white/20 mb-4 border border-black/[0.04] dark:border-white/[0.08]">
                      <i className="fa-solid fa-layer-group text-2xl"></i>
                    </div>
                    <h4 className="text-themeText dark:text-white font-black text-sm">Select a Batch</h4>
                    <p className="text-themeTextSec dark:text-white/50 text-xs font-bold mt-1">Choose an academic batch from the dropdown above to view students and assign fees.</p>
                </div>
              ) : students.length === 0 ? (
                <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-300 dark:text-white/20 mb-4 border border-black/[0.04] dark:border-white/[0.08]">
                      <i className="fa-solid fa-users-slash text-2xl"></i>
                    </div>
                    <h4 className="text-themeText dark:text-white font-black text-sm">No Students Found</h4>
                    <p className="text-themeTextSec dark:text-white/50 text-xs font-bold mt-1">There are no students enrolled in {selectedBatch}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.map(s => {
                    const pendingInv = s.fee_invoices?.filter(i => i.status === 'pending') || [];
                    const isSelected = selectedStudentIds.includes(s.id);
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => pendingInv.length > 0 && setSelectedStudentIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                        className={`bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border ${isSelected ? 'border-emerald-500' : 'border-themeBorder dark:border-white/5'} rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-colors hover:bg-white/5`}
                      >
                        <div>
                          <h4 className="text-sm font-black text-themeText dark:text-white">{s.full_name}</h4>
                          <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{s.erp_id}</p>
                        </div>
                        <div className="text-right">
                          {pendingInv.length > 0 ? (
                            <span className="text-xs font-black text-rose-500 font-mono">Dues: ₹{pendingInv.reduce((a,b)=>a+Number(b.amount),0)}</span>
                          ) : (
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle"></i> Clear</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Assign Fee Form */}
            <div className="w-full xl:w-96 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-6 h-fit shrink-0">
              <h3 className="text-sm font-black text-themeText dark:text-white uppercase tracking-widest mb-6">Assign Bulk Fee</h3>
              <form onSubmit={handleAssignFee} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Fee Title</label>
                  <input type="text" required value={assignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="e.g. Sem 4 Tuition" className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Amount (₹)</label>
                  <input type="number" required value={assignAmount} onChange={e => setAssignAmount(e.target.value)} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Due Date</label>
                  <input type="date" required value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                </div>
                <button type="submit" disabled={!selectedBatch || loading} className="w-full mt-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black transition-colors disabled:opacity-50">
                  Deploy to {selectedBatch || 'Batch'}
                </button>
              </form>
            </div>
          </div>
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
                    <h3 className="text-sm font-black text-themeText dark:text-white uppercase tracking-widest">Pending Dues (Requires Follow-up)</h3>
                  </div>
                  <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {invoiceHistory.filter(i => i.status === 'pending').length === 0 ? (
                      <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                        <i className="fa-solid fa-file-invoice text-gray-300 dark:text-white/20 text-xl mb-3"></i>
                        <p className="text-themeTextSec dark:text-white/50 text-xs font-bold">No pending dues found.</p>
                      </div>
                    ) : invoiceHistory.filter(i => i.status === 'pending').map(inv => (
                      <div key={inv.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-black text-themeText dark:text-white">{inv.profiles?.full_name}</h4>
                          <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{inv.title}</p>
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
                    <h3 className="text-sm font-black text-themeText dark:text-white uppercase tracking-widest">Cleared & Sent</h3>
                  </div>
                  <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {invoiceHistory.filter(i => i.status === 'paid' || i.status === 'successful').length === 0 ? (
                      <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-2xl border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] text-center px-4">
                        <i className="fa-solid fa-receipt text-gray-300 dark:text-white/20 text-xl mb-3"></i>
                        <p className="text-themeTextSec dark:text-white/50 text-xs font-bold">No cleared invoices yet.</p>
                      </div>
                    ) : invoiceHistory.filter(i => i.status === 'paid' || i.status === 'successful').map(inv => (
                      <div key={inv.id} className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-xl p-4 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
                        <div>
                          <h4 className="text-sm font-black text-themeText dark:text-white">{inv.profiles?.full_name}</h4>
                          <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50">{inv.title}</p>
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
    
            {/* Hidden Document Templates for PDF Generation */}
            <div className="hidden">
                <FeeReceiptTemplate ref={luxuryInvoiceRef} invoiceData={currentTxnPayload} studentData={currentTxnPayload?.profiles} />
            </div>
        </div>
    );
}
