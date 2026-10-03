/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { generateNativePayslip } from "../../../DocumentTemplates/NativePayslipEngine";
import { useERP } from '../../../context/ErpContext';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import PageHeader from "../../shared/PageHeader/PageHeader";

export default function FacultyPayroll() {
  const { userSession } = useERP();
  const facultyId = userSession?.db_id || userSession?.id;
  
  const [payslips, setPayslips] = useState([]);
  const [pendingLop, setPendingLop] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    bank_name: '',
    account_number: '',
    ifsc_code: ''
  });

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPayslip = async (slip) => {
    setDownloadingId(slip.id);
    try {
      const base64Pdf = await generateNativePayslip(
        slip, 
        userSession?.full_name || "Faculty", 
        userSession?.erp_id || "ERP",
        userSession?.department || "Faculty of Law"
      );
      const linkSource = `data:application/pdf;base64,${base64Pdf}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = `Payslip_${slip.month}_${slip.year}.pdf`;
      downloadLink.click();
      if (window.erpToast) window.erpToast.show("Secure payslip downloaded.", "success");
    } catch (e) {
      console.error(e);
      if (window.erpToast) window.erpToast.show("Failed to download payslip.", "error");
    }
    setDownloadingId(null);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchPayroll = async () => {
      if (!facultyId) return;
      try {
        const currMonthStart = new Date();
        currMonthStart.setDate(1);
        currMonthStart.setHours(0,0,0,0);
        
        const { data: leaves } = await supabase
          .from('faculty_leaves')
          .select('days')
          .eq('faculty_id', facultyId)
          .eq('leave_type', 'Loss of Pay (LOP)')
          .in('status', ['approved', 'pending'])
          .gte('from_date', currMonthStart.toISOString());
          
        if (leaves && leaves.length > 0) {
          const totalLop = leaves.reduce((sum, l) => sum + (Number(l.days) || 0), 0);
          if (isMounted) setPendingLop(totalLop);
        }
      } catch (e) { console.error(e); }
      
      try {
        const { data } = await supabase
          .from('faculty_payroll')
          .select('*')
          .eq('faculty_id', facultyId)
          .order('payment_date', { ascending: false });

        if (isMounted) {
          setPayslips(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    const fetchAccount = async () => {
      if (!facultyId) return;
      const cached = sessionStorage.getItem(`salary_acc_${facultyId}`);
      if (cached) {
        setAccountDetails(JSON.parse(cached));
      }
      
      try {
        const { data } = await supabase.from('profiles').select('questionnaire_data').eq('id', facultyId).maybeSingle();
        if (data && data.questionnaire_data) {
          let qData = data.questionnaire_data;
          if (typeof qData === 'string') qData = JSON.parse(qData);
          if (qData.bankName || qData.bankAccount || qData.bankIfsc) {
            const dets = { 
              bank_name: qData.bankName || '', 
              account_number: qData.bankAccount || '', 
              ifsc_code: qData.bankIfsc || '' 
            };
            setAccountDetails(dets);
            sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(dets));
          }
        }
      } catch (e) { console.error(e); }
    };

    if (facultyId) {
      fetchPayroll();
      fetchAccount();
    } else {
        // Fallback timeout in case facultyId is permanently null (e.g. invalid session)
        setTimeout(() => { if (isMounted) setLoading(false); }, 3000);
    }
    return () => { isMounted = false; };
  }, [facultyId]);

  const handleSaveAccount = async (e) => {
    e.preventDefault();

    const acctRegex = /^[0-9]{9,18}$/;
    if (!acctRegex.test(accountDetails.account_number)) {
      if (window.erpDialog) window.erpDialog.alert("Account Number must be between 9 and 18 digits.", "error");
      return;
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(accountDetails.ifsc_code)) {
      if (window.erpDialog) window.erpDialog.alert("IFSC Code must be valid (e.g. HDFC0001234).", "error");
      return;
    }

    const msg = "Are you sure you want to securely sync these payroll details?";
    const confirmed = window.erpDialog ? window.erpDialog.confirm(msg) : confirm(msg);
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const { data: currentProfile } = await supabase.from('profiles').select('questionnaire_data').eq('id', facultyId).maybeSingle();
      let existingData = currentProfile?.questionnaire_data || {};
      if (typeof existingData === 'string') existingData = JSON.parse(existingData);

      const updatedData = {
        ...existingData,
        bankName: accountDetails.bank_name,
        bankAccount: accountDetails.account_number,
        bankIfsc: accountDetails.ifsc_code
      };

      const { error } = await supabase.from('profiles').update({
        questionnaire_data: updatedData
      }).eq('id', facultyId);

      if (error) throw error;
      
      sessionStorage.setItem(`salary_acc_${facultyId}`, JSON.stringify(accountDetails));
      if (window.erpDialog) window.erpDialog.alert("Payroll destination synced securely.", "success");
      setShowAccountModal(false);
    } catch (error) { 
      console.error(error); 
      if (window.erpDialog) window.erpDialog.alert("Failed to sync account details.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const hasAccount = accountDetails.account_number && accountDetails.bank_name;
  const lastPayslip = payslips[0];

  return (
    <div className="w-full min-h-screen bg-transparent text-themeText font-sans animate-fade-in selection:bg-[#d4af37]/30">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 pb-10 lg:pb-12 flex flex-col gap-6 lg:gap-8">
        
        <PageHeader 
          icon="fa-solid fa-file-invoice-dollar" 
          title="Payroll & HR" 
          subtitle="Manage your compensation, view slips, and update bank records."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Last Net Pay */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#5D4037] to-[#3E2723] rounded-3xl p-6 lg:p-8 flex flex-col justify-between group shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mb-6 shadow-inner">
              <i className="fa-solid fa-wallet text-2xl"></i>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black tracking-tighter text-white mb-1 font-mono drop-shadow-md">
                ₹{lastPayslip ? lastPayslip.net_pay.toLocaleString('en-IN') : '0.00'}
              </h3>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#d4af37]">Last Net Pay</p>
            </div>
          </div>

          {/* LOP Deductions */}
          <div className="bg-themePanel border border-themeBorder rounded-3xl p-6 lg:p-8 flex flex-col justify-between group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
              <i className="fa-solid fa-calendar-minus text-2xl"></i>
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter text-themeText mb-1">{pendingLop} <span className="text-sm text-themeTextSec font-bold tracking-normal">Days</span></h3>
              <p className="text-[11px] font-black uppercase tracking-widest text-rose-500">Pending LOP (This Month)</p>
            </div>
          </div>

          {/* Salary Account */}
          <div className="bg-themePanel border border-themeBorder rounded-3xl p-6 lg:p-8 flex flex-col justify-between group relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${hasAccount ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                <i className="fa-solid fa-building-columns text-2xl"></i>
              </div>
              <button 
                onClick={() => setShowAccountModal(true)}
                className="px-5 py-2 rounded-xl bg-themePanel/5 hover:bg-themePanel/10 border border-themeBorder text-[10px] font-black uppercase tracking-widest text-themeText transition-colors shadow-sm"
              >
                {hasAccount ? 'Update' : 'Add Info'}
              </button>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight text-themeText mb-1 truncate">
                {hasAccount ? accountDetails.bank_name : 'No Account Configured'}
              </h3>
              <p className="text-[11px] font-black uppercase tracking-widest text-themeTextSec flex items-center gap-1.5">
                {hasAccount ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Active (•••{accountDetails.account_number.slice(-4)})
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span> Action Required
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl lg:text-2xl font-black tracking-tight text-themeText flex items-center gap-3">
              <i className="fa-solid fa-list-check text-[#d4af37]"></i>
              Payslip Ledger
            </h3>
            <span className="px-3 py-1 rounded-md bg-[#5D4037]/10 text-[#5D4037] text-[10px] font-black uppercase tracking-widest border border-[#5D4037]/20">Official Records</span>
          </div>
          
          {loading ? (
            <div className="w-full py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-[#5D4037]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Syncing Financials...</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="w-full py-24 lg:py-32 bg-themeElevated/50 border border-themeBorder/50 rounded-3xl text-center flex flex-col items-center justify-center">
              <i className="fa-solid fa-file-invoice-dollar text-5xl lg:text-6xl text-neutral-800 dark:text-neutral-600 mb-6 drop-shadow-sm"></i>
              <h3 className="text-xl lg:text-2xl font-black text-themeText mb-2 tracking-tight">No Payslips Available</h3>
              <p className="text-xs font-bold text-themeTextSec max-w-sm mx-auto">Your payroll records will appear here securely once disbursed by the HR & Administration department.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {payslips.map(slip => (
                <div key={slip.id} className="bg-themePanel border border-themeBorder rounded-3xl p-6 lg:p-8 flex flex-col justify-between group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-[#d4af37]/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <h4 className="text-xl font-black text-themeText uppercase tracking-wider">{slip.month} {slip.year}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#64748b] mt-1">Disbursed on {new Date(slip.payment_date).toLocaleDateString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#5D4037]/5 text-[#5D4037] flex items-center justify-center border border-[#5D4037]/10">
                      <i className="fa-solid fa-check text-sm"></i>
                    </div>
                  </div>
                  
                  <div className="bg-[#f8fafc] dark:bg-[#1e1e1e] rounded-2xl p-4 mb-6 border border-[#e2e8f0] dark:border-[#2d2d2d] flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-themeTextSec">Net Amount</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{slip.net_pay.toLocaleString('en-IN')}</span>
                  </div>

                  <button 
                    onClick={() => handleDownloadPayslip(slip)} 
                    disabled={downloadingId === slip.id} 
                    className="w-full py-4 rounded-xl bg-[#5D4037] hover:bg-[#3E2723] text-white text-sm font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(93,64,55,0.2)]"
                  >
                    {downloadingId === slip.id ? (
                      <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating...</>
                    ) : (
                      <><i className="fa-solid fa-file-pdf"></i> Download Official Slip</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAccountModal(false)}></div>
          <div className="relative w-full max-w-md bg-themePanel border border-themeBorder rounded-[2rem] shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-themeText tracking-tight">Salary Account</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-1">Provide your payroll destination</p>
                </div>
                <button onClick={() => setShowAccountModal(false)} className="w-8 h-8 rounded-full bg-themePanel/5 hover:bg-rose-500/10 text-themeTextSec hover:text-rose-500 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSaveAccount} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Bank Name</label>
                  <input type="text" required value={accountDetails.bank_name} onChange={(e) => setAccountDetails({...accountDetails, bank_name: e.target.value})} placeholder="e.g. HDFC Bank" className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Account Number</label>
                  <input type="text" required value={accountDetails.account_number} onChange={(e) => setAccountDetails({...accountDetails, account_number: e.target.value.replace(/\D/g, '')})} placeholder="Account Number" maxLength={18} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">IFSC Code</label>
                  <input type="text" required value={accountDetails.ifsc_code} onChange={(e) => {
                    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                    if (val.length > 0) val = val.substring(0, 4).replace(/[^A-Z]/g, '') + val.substring(4);
                    if (val.length > 4) val = val.substring(0, 4) + '0' + val.substring(5);
                    setAccountDetails({...accountDetails, ifsc_code: val});
                  }} placeholder="HDFC0001234" maxLength={11} className="w-full bg-themeElevated dark:bg-themeApp border border-themeBorder rounded-xl px-4 py-3.5 text-sm font-bold text-themeText focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition uppercase font-mono" />
                </div>
                <button type="submit" disabled={isSaving} className="w-full mt-4 py-4 rounded-xl bg-[#5D4037] hover:bg-[#3E2723] text-white font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
                  {isSaving ? 'Syncing...' : 'Save Payroll Destination'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
