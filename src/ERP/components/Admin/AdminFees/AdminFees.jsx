/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { theme } from '../../../../Shared/theme';
import { useERP } from '../../../context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function AdminFees({ isEmbedded = false }) {
 const { userSession } = useERP();
 const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'batch'
 const [loading, setLoading] = useState(false);

 // --- OVERVIEW STATE ---
 const [overviewData, setOverviewData] = useState({ totalExpected: 0, totalCollected: 0, pendingCount: 0 });
 const [fetchingOverview, setFetchingOverview] = useState(true);

 // --- BATCH MANAGER STATE ---
 const [batches, setBatches] = useState([]);
 const [selectedBatch, setSelectedBatch] = useState('');
 const [students, setStudents] = useState([]);
 const [selectedStudentIds, setSelectedStudentIds] = useState([]);
 const [debugError, setDebugError] = useState(null);
 
 // Assign Fee Form
 const [assignTitle, setAssignTitle] = useState('');
 const [assignAmount, setAssignAmount] = useState('');
 const [assignDueDate, setAssignDueDate] = useState('');
 const [assignType, setAssignType] = useState('Tuition');

 useEffect(() => {
 if (activeTab === 'overview') fetchOverview();
 if (activeTab === 'batch') {
 fetchBatches();
 if (selectedBatch) fetchBatchStudents(selectedBatch);
 }
 }, [activeTab]);

 useEffect(() => {
 if (selectedBatch && activeTab === 'batch') {
 fetchBatchStudents(selectedBatch);
 }
 }, [selectedBatch]);

 // ================== TAB 1: OVERVIEW ==================
 const fetchOverview = async () => {
 setFetchingOverview(true);
 try {
 const { data: invoices, error } = await supabase.from('fee_invoices').select('amount, status');
 if (error) throw error;
 
 let expected = 0;
 let collected = 0;
 let count = 0;

 if (invoices) {
 invoices.forEach(inv => {
 expected += Number(inv.amount);
 if (inv.status === 'paid') collected += Number(inv.amount);
 if (inv.status === 'pending') count += 1;
 });
 }
 setOverviewData({ totalExpected: expected, totalCollected: collected, pendingCount: count });
 } catch (e) {
 console.error(e);
 } finally {
 setFetchingOverview(false);
 }
 };

 // ================== TAB 2: BATCH MANAGER ==================
 const fetchBatches = async () => {
 try {
 const { data, error } = await supabase.from('profiles').select('academic_batch').eq('role', 'student');
 if (error) throw error;
 const distinctBatches = [...new Set(data.map(item => item.academic_batch).filter(Boolean))].sort();
 setBatches(distinctBatches);
 } catch (err) {
 console.error(err);
 }
 };

 const fetchBatchStudents = async (batchName) => {
 setLoading(true);
 setSelectedStudentIds([]);
 try {
 // Fetch students and their fee invoices
 const { data, error } = await supabase
 .from('profiles')
 .select(`
 id, full_name, erp_id, academic_batch,
 fee_invoices ( id, title, amount, status, due_date )
 `)
 .eq('role', 'student')
 .eq('academic_batch', batchName)
 .order('full_name', { ascending: true });
 
 if (error) throw error;
 setStudents(data || []);
 } catch (err) {
 console.error(err);
 setDebugError(err.message || JSON.stringify(err));
 // window.erpDialog?.alert("Failed to fetch students for this batch.");
 } finally {
 setLoading(false);
 }
 };

 const handleSelectAll = (e) => {
 if (e.target.checked) {
 setSelectedStudentIds(students.map(s => s.id));
 } else {
 setSelectedStudentIds([]);
 }
 };

 const handleSelectStudent = (id) => {
 setSelectedStudentIds(prev => 
 prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
 );
 };

 const handleAssignFees = async (e) => {
 e.preventDefault();
 if (selectedStudentIds.length === 0) return window.erpDialog?.alert("Please select at least one student.");
 if (!assignTitle || !assignAmount || !assignDueDate) return window.erpDialog?.alert("Please fill out all fee details.");

 const confirm = window.confirm(`Generate invoices of ₹${assignAmount} for ${selectedStudentIds.length} selected students?`);
 if (!confirm) return;

 setLoading(true);
 try {
 const invoices = selectedStudentIds.map(id => ({
 student_id: id,
 title: assignTitle,
 amount: Number(assignAmount),
 due_date: assignDueDate,
 type: assignType,
 status: 'pending'
 }));

 const { error } = await supabase.from('fee_invoices').insert(invoices);
 if (error) throw error;

 window.erpDialog?.alert(`Successfully assigned fees to ${selectedStudentIds.length} students!`);
 setAssignTitle(''); setAssignAmount(''); setAssignDueDate('');
 setSelectedStudentIds([]);
 fetchBatchStudents(selectedBatch);
 } catch (err) {
 console.error(err);
 window.erpDialog?.alert("Failed to assign fees.");
 } finally {
 setLoading(false);
 }
 };

 const handleMarkPaid = async (studentId, invoice) => {
 const confirm = window.confirm(`Mark "${invoice.title}" as PAID for this student?`);
 if (!confirm) return;
 
 setLoading(true);
 try {
 // Mark Paid
 const { error: invError } = await supabase.from('fee_invoices').update({ status: 'paid' }).eq('id', invoice.id);
 if (invError) throw invError;
 
 // Insert Txn
 const transactionId = `MAN${Math.floor(Math.random() * 100000000)}`;
 const { error: txnError } = await supabase.from('fee_transactions').insert({
 id: transactionId,
 student_id: studentId,
 amount: invoice.amount,
 status: 'successful',
 method: 'Manual Cash/Cheque',
 purpose: invoice.title
 });
 if (txnError) throw txnError;

 fetchBatchStudents(selectedBatch);
 } catch (e) {
 console.error(e);
 window.erpDialog?.alert("Failed to record payment.");
 } finally {
 setLoading(false);
 }
 };

 const handleBulkMarkPaid = async () => {
 if (selectedStudentIds.length === 0) return window.erpDialog?.alert("Please select students with pending invoices.");
 
 // Find all pending invoices for selected students
 const pendingInvoices = [];
 selectedStudentIds.forEach(studentId => {
 const student = students.find(s => s.id === studentId);
 if (student && student.fee_invoices) {
 student.fee_invoices.filter(i => i.status === 'pending').forEach(inv => {
 pendingInvoices.push({ studentId, invoice: inv });
 });
 }
 });

 if (pendingInvoices.length === 0) return window.erpDialog?.alert("Selected students have no pending invoices to mark as paid.");

 const confirm = window.confirm(`You are about to mark ${pendingInvoices.length} pending invoices as PAID. Proceed?`);
 if (!confirm) return;

 setLoading(true);
 try {
 for (const item of pendingInvoices) {
 // Update Invoice
 await supabase.from('fee_invoices').update({ status: 'paid' }).eq('id', item.invoice.id);
 // Insert Txn
 const transactionId = `B-MAN${Math.floor(Math.random() * 100000000)}`;
 await supabase.from('fee_transactions').insert({
 id: transactionId,
 student_id: item.studentId,
 amount: item.invoice.amount,
 status: 'successful',
 method: 'Bulk Manual',
 purpose: item.invoice.title
 });
 }
 window.erpDialog?.alert(`Successfully processed ${pendingInvoices.length} payments!`);
 setSelectedStudentIds([]);
 fetchBatchStudents(selectedBatch);
 } catch (e) {
 console.error(e);
 window.erpDialog?.alert("An error occurred during bulk payment processing.");
 } finally {
 setLoading(false);
 }
 };

 // Helper to determine student status
 const getStudentStatus = (student) => {
 if (!student.fee_invoices || student.fee_invoices.length === 0) return { label: 'No Invoices', color: 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20' };
 
 const pending = student.fee_invoices.filter(i => i.status === 'pending');
 if (pending.length > 0) return { label: 'Unpaid Dues', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', count: pending.length, pendingInvoices: pending };
 
 return { label: 'Fully Paid', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
 };

 return (
 <div className={`w-full animate-fade-in selection:bg-themeElevated ${!isEmbedded ? "min-h-screen bg-themeApp text-themeText" : ""}`}>
 <div className={`max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 ${!isEmbedded ? "p-4 sm:p-6 lg:p-8 pb-32 lg:pb-12" : "pb-10"}`}>
 
 {/* Header and Tabs */}
 <PageHeader icon="fa-solid fa-coins" title="Finance Ledger" subtitle="Master finance control center." rightContent={
<>
{/* Tabs */}
 <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/20 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
 {['overview', 'batch'].map(tab => (
 <button 
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
 activeTab === tab 
 ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-black dark:text-white border border-black/10 dark:border-white/40 scale-100' 
 : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
 }`}
 >
 {tab === 'overview' ? 'Overview' : 'Batch Manager'}
 </button>
 ))}
 </div>
 </>
} />

 {/* Content */}
 <div className="relative z-10">
 {/* TAB 1: OVERVIEW */}
 {activeTab === 'overview' && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {fetchingOverview ? (
 <div className="col-span-full py-12 text-center text-themeTextSec"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent"></i></div>
 ) : (
 <>
 <div className={`${theme.layout.panel} rounded-[2rem] border border-white/5 p-8 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
 <p className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-2">Total Expected Revenue</p>
 <h2 className="text-4xl font-black text-themeText font-mono tracking-tighter">₹{overviewData.totalExpected.toLocaleString()}</h2>
 </div>
 <div className={`${theme.layout.panel} rounded-[2rem] border border-white/5 p-8 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
 <p className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-2">Total Collected</p>
 <h2 className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">₹{overviewData.totalCollected.toLocaleString()}</h2>
 </div>
 <div className={`${theme.layout.panel} rounded-[2rem] border border-white/5 p-8 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
 <p className="text-[10px] font-black text-themeTextSec uppercase tracking-widest mb-2">Pending Invoices</p>
 <h2 className="text-4xl font-black text-rose-500 font-mono tracking-tighter">{overviewData.pendingCount}</h2>
 <p className="text-xs font-bold text-themeTextSec mt-3">Deficit: <span className="text-themeText font-black">₹{(overviewData.totalExpected - overviewData.totalCollected).toLocaleString()}</span></p>
 </div>
 </>
 )}
 </div>
 )}

 {/* TAB 2: BATCH MANAGER */}
 {activeTab === 'batch' && (
 <div className="flex flex-col gap-6">
 {/* Top Control Bar */}
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-end justify-between">
 <div className="w-full md:w-1/3">
 <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 pl-1">Select Academic Batch</label>
 <div className="relative">
 <select 
 value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
 className="w-full bg-themeElevated/90 backdrop-blur-2xl border border-white/5 hover:border-black/5 dark:border-white/10 text-themeText rounded-xl px-4 py-3.5 text-sm font-bold transition-colors appearance-none outline-none focus:border-themeAccent"
 >
 <option value="" disabled>Select Batch to Manage...</option>
 {batches.map(b => <option key={b} value={b}>{b}</option>)}
 </select>
 <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec text-xs pointer-events-none"></i>
 </div>
 </div>

 {selectedBatch && (
 <div className="flex gap-4">
 <button 
 onClick={handleBulkMarkPaid}
 disabled={selectedStudentIds.length === 0 || loading}
 className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 <i className="fa-solid fa-check-double"></i> Mark Selected Paid
 </button>
 </div>
 )}
 </div>

 {/* Assign Fees Panel (Only visible if students are selected) */}
 {selectedBatch && selectedStudentIds.length > 0 && (
 <div className="bg-themeElevated/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 animate-fade-in flex flex-col xl:flex-row gap-6 xl:items-end">
 <div className="flex-1">
 <h3 className="text-sm font-black text-themeText uppercase tracking-widest mb-4 flex items-center gap-2">
 <i className="fa-solid fa-file-invoice text-themeAccent"></i> Assign New Fee to {selectedStudentIds.length} Students
 </h3>
 <form id="assign-fee-form" onSubmit={handleAssignFees} className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <input type="text" value={assignTitle} onChange={e => setAssignTitle(e.target.value)} required placeholder="Invoice Title (e.g. Exam Fee)" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-themeAccent text-themeText" />
 </div>
 <div>
 <input type="number" value={assignAmount} onChange={e => setAssignAmount(e.target.value)} required placeholder="Amount (₹)" min="1" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-themeAccent text-themeText" />
 </div>
 <div>
 <input type="date" value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)} required className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-themeAccent text-themeText" />
 </div>
 <div>
 <select value={assignType} onChange={e => setAssignType(e.target.value)} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-themeAccent text-themeText appearance-none">
 {['Tuition', 'Hostel', 'Library', 'Examination', 'Fine', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>
 </form>
 </div>
 <button form="assign-fee-form" type="submit" disabled={loading} className="btn-erp">
 Generate Invoices
 </button>
 </div>
 )}

 {/* Spreadsheet Grid */}
 {selectedBatch && (
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col min-h-[400px]">
 {loading ? (
 <div className="flex-1 flex items-center justify-center py-20">
 <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent"></i>
 </div>
 ) : (students.length === 0 || debugError) ? (
 <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
 <i className="fa-solid fa-users-slash text-4xl text-themeTextSec/50 mb-4"></i>
 <h3 className="text-sm font-black text-themeText tracking-widest uppercase mb-2">
 {debugError ? "Database Error" : "No Students Found"}
 </h3>
 <p className="text-xs font-bold text-themeTextSec max-w-md">
 {debugError ? debugError : `There are no students enrolled in ${selectedBatch}.`}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-themeElevated/50 border-b border-white/5">
 <th className="p-4 w-12 text-center">
 <input 
 type="checkbox" 
 checked={selectedStudentIds.length === students.length && students.length > 0}
 onChange={handleSelectAll}
 className="w-4 h-4 rounded border-white/5 text-themeAccent focus:ring-themeAccent bg-themeElevated/90 backdrop-blur-2xl cursor-pointer"
 />
 </th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Student Details</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Status</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Pending Amount</th>
 <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {students.map(student => {
 const status = getStudentStatus(student);
 const isSelected = selectedStudentIds.includes(student.id);
 const totalPending = status.pendingInvoices ? status.pendingInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0) : 0;
 
 return (
 <tr key={student.id} className={`border-b border-white/5/50 transition-colors ${isSelected ? 'bg-themeAccent/5' : 'hover:bg-themeElevated/30'}`}>
 <td className="p-4 text-center">
 <input 
 type="checkbox"
 checked={isSelected}
 onChange={() => handleSelectStudent(student.id)}
 className="w-4 h-4 rounded border-white/5 text-themeAccent focus:ring-themeAccent bg-themeElevated/90 backdrop-blur-2xl cursor-pointer"
 />
 </td>
 <td className="p-4">
 <div className="flex flex-col">
 <span className="font-black text-themeText text-sm">{student.full_name}</span>
 <span className="text-[10px] font-bold text-themeTextSec font-mono">{student.erp_id}</span>
 </div>
 </td>
 <td className="p-4">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest ${status.color}`}>
 {status.count ? <><i className="fa-solid fa-circle-exclamation"></i> {status.label} ({status.count})</> : status.label}
 </span>
 </td>
 <td className="p-4">
 {totalPending > 0 ? (
 <span className="font-mono font-black text-rose-500">₹{totalPending.toLocaleString()}</span>
 ) : (
 <span className="font-mono font-bold text-themeTextSec">₹0</span>
 )}
 </td>
 <td className="p-4 text-right">
 {status.pendingInvoices && status.pendingInvoices.length > 0 ? (
 <div className="flex flex-col gap-2 items-end">
 {status.pendingInvoices.map(inv => (
 <button 
 key={inv.id}
 onClick={() => handleMarkPaid(student.id, inv)}
 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-white border border-emerald-500/30 hover:bg-emerald-500 px-3 py-1.5 rounded transition flex items-center gap-2"
 >
 Mark Paid: {inv.title} (₹{inv.amount})
 </button>
 ))}
 </div>
 ) : (
 <span className="text-[10px] font-black uppercase text-themeTextSec/50 tracking-widest">-</span>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}