/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { generateComponentPDF } from '../../../DocumentTemplates/pdfEngine';
import { generateNativePayslip } from '../../../DocumentTemplates/NativePayslipEngine';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

import { sendSystemEmail } from '../../../lib/EmailService';
import QRCode from 'react-qr-code';
import { getAvatarUrl } from '../../../utils/avatarUtils';


export default function AdminPayroll() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for personalized pay overrides
    const [customBasePays, setCustomBasePays] = useState({});
    
    // Dynamic Configuration States
    const [config, setConfig] = useState({ 
        defaultBasePay: 85000, 
        allowedPaidLeaves: 2,
        breakdown: [
            { name: 'Basic Pay', percentage: 50 },
            { name: 'HRA', percentage: 30 },
            { name: 'Special Allowance', percentage: 20 }
        ]
    });
    const [isSavingConfig, setIsSavingConfig] = useState(false);
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
        transactionId: '',
        professionalTax: 200,
        tdsPercentage: 10,
        tdsAmount: 0
    });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            // Load base payroll config
            const { data: sysData } = await supabase.from('system_settings').select('value').eq('key', 'payroll_config').maybeSingle();
            let newConfig = { ...config };
            if (sysData?.value) {
                newConfig = { ...newConfig, ...sysData.value, breakdown: sysData.value.breakdown || config.breakdown };
            }
            
            // Sync with global leave policies (Casual Leave)
            try {
                const { data: policyData } = await supabase.from('leave_policies').select('annual_limit').eq('name', 'Casual Leave (CL)').maybeSingle();
                if (policyData) {
                    const monthlyLeaves = Math.max(0, Math.floor(policyData.annual_limit / 12));
                    newConfig.allowedPaidLeaves = monthlyLeaves;
                }
            } catch (e) {}

            setConfig(newConfig);
        };
        loadConfig();
    }, []);

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await supabase.from('system_settings').upsert({ key: 'payroll_config', value: config });
            if(window.erpToast) window.erpToast.show("✅ Policy Engine updated successfully.", "success");
        } catch (e) { console.error(e); if (window.erpToast) window.erpToast.show("An error occurred. Please try again.", "error"); } finally {
            setIsSavingConfig(false);
        }
    };
    
    const updateConfig = async (newConfig) => {
        setConfig(newConfig);
        // We removed auto-save on blur so the user uses the Save button for complex array edits
    };
    
    const handleAddBreakdown = () => {
        setConfig({ ...config, breakdown: [...(config.breakdown || []), { name: 'New Component', percentage: 0 }] });
    };

    const handleUpdateBreakdown = (idx, field, val) => {
        const newBd = [...(config.breakdown || [])];
        newBd[idx][field] = field === 'percentage' ? Number(val) : val;
        setConfig({ ...config, breakdown: newBd });
    };

    const handleRemoveBreakdown = (idx) => {
        const newBd = [...(config.breakdown || [])];
        newBd.splice(idx, 1);
        setConfig({ ...config, breakdown: newBd });
    };

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const { data: facultyData, error } = await supabase.from('profiles').select('*').eq('role', 'faculty');
            if (error) throw error;
            if (facultyData) {
                const currentMonthStart = new Date();
                currentMonthStart.setDate(1);
                currentMonthStart.setHours(0,0,0,0);
                
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
                    .select('faculty_id, month, year');
                
                const currentMonth = new Date().toLocaleString('default', { month: 'long' });
                const currentYear = new Date().getFullYear().toString();

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

                    const lopDays = Math.max(0, totalLeaveDays - config.allowedPaidLeaves);
                    
                    // Personalized Pay Logic: State Override -> DB Column -> Default Config
                    const basePay = f.base_salary ? Number(f.base_salary) : config.defaultBasePay;
                    const waivedDays = 0;
                    
                    const dailyRate = basePay / 30;
                    const grossLopAmount = Math.round(lopDays * dailyRate);
                    const waivedAmount = 0;
                    const deduction = Math.max(0, grossLopAmount - waivedAmount);
                    
                    const netPay = basePay - deduction;
                    
                    let struct = f.salary_structure;
                    if (!struct || !Array.isArray(struct)) {
                        struct = [
                            { name: "Basic Pay", percentage: 50 },
                            { name: "HRA", percentage: 30 },
                            { name: "Special Allowance", percentage: 20 }
                        ];
                    }

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

    useEffect(() => {
        fetchFaculty();
    }, [config.defaultBasePay, config.allowedPaidLeaves]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    // Dynamic TDS Calculation
    useEffect(() => {
        if (selectedFac) {
            const taxableAmount = selectedFac.netPay;
            const tdsAmt = Math.round(taxableAmount * (paymentForm.tdsPercentage / 100));
            setPaymentForm(prev => ({ ...prev, tdsAmount: tdsAmt }));
        }
    }, [paymentForm.tdsPercentage, selectedFac]);

    const handleOpenPayment = (fac) => {
        setSelectedFac(fac);
        setShowPaymentModal(true);
        // Reset form
        setPaymentForm(prev => ({
            ...prev,
            transactionId: '',
            professionalTax: 200,
            tdsPercentage: 10 }));
    };

    
    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        const confirmed = await new Promise(res => window.erpDialog ? window.erpDialog.confirm("Are you sure you want to finalize this payroll disbursal? This action will generate the encrypted PDF and cannot be undone.", res) : res(window.confirm("Finalize payroll?")));
        if (!confirmed) return;
        
        setIsProcessing(true);
        try {
            const finalNetPay = selectedFac.netPay - paymentForm.professionalTax - paymentForm.tdsAmount;
            
            const payload = {
                faculty_id: selectedFac.id,
                base_pay: selectedFac.basePay,
                base_salary: selectedFac.basePay, // Legacy column required by DB constraint
                
                deductions: selectedFac.deduction,
                net_pay: selectedFac.netPay, // Pre-tax net
                final_net_pay: finalNetPay,  // Post-tax net
                professional_tax: paymentForm.professionalTax,
                tds_amount: paymentForm.tdsAmount,
                tds_percentage: paymentForm.tdsPercentage,
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
                content: `Your salary for ${currentMonth} ${currentYear} has been disbursed.`,
                author_name: 'Finance Department',
                author_id: null
            }]);

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

            setFaculty(prev => prev.map(f => f.id === selectedFac.id ? { ...f, isProcessed: true } : f));
            
            if(window.erpToast) window.erpToast.show("✅ Payment processed & Recorded. Ultra Luxury Encrypted PDF Generated.", "success");
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

    const handleUpdateStructure = (facId, index, field, value) => {
        setFaculty(prev => prev.map(f => {
            if (f.id !== facId) return f;
            const newStructure = [...(f.salary_structure || [])];
            newStructure[index] = { ...newStructure[index], [field]: field === 'percentage' ? Number(value) || 0 : value };
            return { ...f, salary_structure: newStructure };
        }));
    };

    return (
        <section className="w-full animate-fade-in pb-12">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                
                {/* CONFIGURATION PANEL */}
                <div className="lg:col-span-1 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-2xl p-6 flex flex-col h-fit">
                    <h2 className="text-xl font-black text-themeText dark:text-white tracking-tight mb-2">Policy Engine</h2>
                    <p className="text-xs font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest mb-6">Automated LOP Criteria</p>
                    
                    <div className="flex flex-col gap-5 flex-1">
                        <div>
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Standard Base Pay (₹)</label>
                            <input 
                                type="number" 
                                value={config.defaultBasePay} 
                                onChange={e => setConfig({...config, defaultBasePay: Number(e.target.value)})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Allowed Paid Leaves / Month</label>
                            <input 
                                type="number" 
                                value={config.allowedPaidLeaves} 
                                onChange={e => setConfig({...config, allowedPaidLeaves: Number(e.target.value)})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-themeBorder dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500 transition-colors" 
                            />
                        </div>
                        
                        {/* Dynamic Breakdown */}
                        

                        <button 
                            onClick={handleSaveConfig}
                            disabled={isSavingConfig}
                            className="w-full py-3.5 mt-2 bg-white/5 hover:bg-white/10 rounded-xl text-themeText dark:text-white text-xs font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                        </button>

                    </div>
                </div>

                {/* FACULTY ROSTER CARDS */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-themeText dark:text-white tracking-tight">Faculty Payroll</h2>
                            <span className="inline-block mt-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                Current Month
                            </span>
                        </div>
                        <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-black/10 dark:border-white/10">
                            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-themeElevated shadow-sm text-themeText' : 'text-themeTextSec hover:text-themeText dark:text-white/50 dark:hover:text-white'}`}>
                                <i className="fa-solid fa-border-all"></i> Grid
                            </button>
                            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white dark:bg-themeElevated shadow-sm text-themeText' : 'text-themeTextSec hover:text-themeText dark:text-white/50 dark:hover:text-white'}`}>
                                <i className="fa-solid fa-list"></i> List
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="w-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {faculty.map(f => (
                                <div key={f.id} className="bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group">
                                    {f.isProcessed && (
                                        <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Paid
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-4">
                                        {f.profile_picture_url ? (
                                            <img src={f.profile_picture_url} alt={f.full_name} className="w-12 h-12 rounded-full object-cover border border-themeBorder dark:border-white/10 shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-themeBorder dark:border-white/10 text-themeTextSec dark:text-white/50 flex items-center justify-center font-black text-lg shadow-sm">
                                                {f.full_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-base font-black text-themeText dark:text-white">{f.full_name}</h4>
                                            <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">{f.erp_id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] rounded-xl p-4 border border-black/[0.04] dark:border-white/[0.08]">
                                        <div className="flex flex-col mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Gross Base Salary (Editable)</span>
                                                    <button aria-label={expandedCards.includes(f.id) ? "Collapse breakdown" : "Expand breakdown"} onClick={() => toggleCardBreakdown(f.id)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-themeTextSec dark:text-white/40 hover:text-themeText dark:text-white transition-colors">
                                                        <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${expandedCards.includes(f.id) ? 'rotate-180' : ''}`}></i>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-themeTextSec font-bold">₹</span>
                                                    <input 
                                                        type="number"
                                                        value={f.basePay}
                                                        onChange={(e) => handleFacultyPropUpdate(f.id, 'basePay', e.target.value)}
                                                        className="bg-transparent border-b border-themeBorder dark:border-white/20 text-sm font-black text-themeText dark:text-white font-mono w-24 outline-none focus:border-amber-500 transition-colors py-0.5"
                                                    />
                                                </div>
                                            </div>
                                            {/* Personalized Salary Breakdown (Editable) */}
                                            {expandedCards.includes(f.id) && (
                                                <div className="flex flex-col gap-2 pl-3 border-l border-themeBorder dark:border-white/10 ml-1.5 mt-3 mb-2 animate-fade-in bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                                    <div className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mb-2 flex justify-between items-center border-b border-themeBorder dark:border-white/10 pb-1">
                                                        <span>Personalized Pay Structure</span>
                                                        <button onClick={() => {
                                                            setFaculty(prev => prev.map(fac => fac.id === f.id ? { ...fac, salary_structure: [...(fac.salary_structure || []), { name: 'New Component', percentage: 0 }] } : fac));
                                                        }} className="text-amber-500 hover:text-amber-600 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                            <i className="fa-solid fa-plus"></i> Add
                                                        </button>
                                                    </div>
                                                    {(f.salary_structure || []).map((b, i) => (
                                                        <div key={i} className="flex gap-2 items-center group">
                                                            <input type="text" value={b.name} onChange={e => handleUpdateStructure(f.id, i, 'name', e.target.value)} className="w-full flex-1 bg-transparent border-b border-transparent hover:border-themeBorder focus:border-amber-500 text-[10px] font-bold text-themeTextSec dark:text-white/70 outline-none transition-colors" />
                                                            <div className="flex items-center bg-black/5 dark:bg-white/5 rounded px-1">
                                                                <input type="number" value={b.percentage} onChange={e => handleUpdateStructure(f.id, i, 'percentage', e.target.value)} className="w-8 bg-transparent text-xs font-black text-amber-500 outline-none text-right" />
                                                                <span className="text-[10px] text-amber-500/50 ml-0.5">%</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 group/amt border-b border-transparent hover:border-themeBorder focus-within:border-amber-500 transition-colors px-1">
                                                                <span className="text-[10px] text-themeTextSec font-bold">₹</span>
                                                                <input 
                                                                    type="number" 
                                                                    value={Math.round(f.basePay * (b.percentage / 100))}
                                                                    onChange={e => handleUpdateStructure(f.id, i, 'percentage', (Number(e.target.value) / f.basePay) * 100)}
                                                                    className="w-14 bg-transparent text-[10px] font-medium text-themeTextSec dark:text-white/50 font-mono text-right outline-none"
                                                                />
                                                            </div>
                                                            <button onClick={() => {
                                                                setFaculty(prev => prev.map(fac => fac.id === f.id ? { ...fac, salary_structure: fac.salary_structure.filter((_, idx) => idx !== i) } : fac));
                                                            }} className="text-rose-500/0 group-hover:text-rose-500/50 hover:!text-rose-500 transition-colors w-4 text-center">
                                                                <i className="fa-solid fa-xmark text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-themeBorder dark:border-white/10">
                                                        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">Total Weight:</span>
                                                        <span className={`text-[10px] font-black ${(f.salary_structure || []).reduce((acc, curr) => acc + Number(curr.percentage || 0), 0) === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {(f.salary_structure || []).reduce((acc, curr) => acc + Number(curr.percentage || 0), 0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Preferred Account</span>
                                            <span className="text-[11px] font-bold text-white/80">{f.bankDetails.bankName} (..{f.bankDetails.accountNo?.slice(-4) || 'N/A'})</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">Leaves (Total/LOP)</span>
                                            <span className="text-xs font-black text-rose-500">{f.totalLeaveDays} / {f.lopDays} LOP</span>
                                        </div>
                                        <div className="w-full h-px bg-white/5 my-3"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Pre-Tax Net Pay</span>
                                            <span className="text-base font-black text-amber-500 font-mono">{formatCurrency(f.netPay)}</span>
                                        </div>
                                        <div className="w-full h-px bg-white/5 my-3"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Annual CTC</span>
                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-500 font-mono">{formatCurrency(f.basePay * 12)}</span>
                                        </div>
                                    </div>

                                    {!f.isProcessed && (
                                        <button 
                                            onClick={() => handleOpenPayment(f)} 
                                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-themeBorder dark:border-white/10 rounded-xl text-themeText dark:text-white text-xs font-black transition-colors"
                                        >
                                            Process Payment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                            ) : (
                                
                            <div className="flex flex-col gap-3">
                                    {faculty.map(f => (
                                        <div key={f.id} className="bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-black/10 dark:hover:bg-white/5">
                                            
                                            <div className="flex items-center gap-4 flex-1">
                                                <img src={getAvatarUrl({ name: f.full_name, avatar_url: f.profile_picture_url })} alt={f.full_name} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(f.full_name)}&background=random&color=fff&rounded=true&bold=true`; }} className="w-10 h-10 rounded-full object-cover border border-themeBorder dark:border-white/10 shadow-sm" />
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-black text-themeText dark:text-white">{f.full_name}</h4>
                                                        {f.isProcessed && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Paid</span>}
                                                    </div>
                                                    <p className="text-[9px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">{f.erp_id} • {f.totalLeaveDays} LVS / {f.lopDays} LOP</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start md:items-end flex-1">
                                                <span className="text-[9px] font-black text-themeTextSec dark:text-white/40 uppercase tracking-widest">Base / Net Pay</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-bold text-themeTextSec dark:text-white/50 line-through">₹{formatCurrency(f.basePay)}</span>
                                                    <span className="text-sm font-black text-amber-500 font-mono">₹{formatCurrency(f.netPay)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenPayment(f)}
                                                    disabled={f.isProcessed}
                                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-black/10 dark:disabled:bg-white/10 text-black dark:disabled:text-white/50 rounded-xl text-xs font-black transition-colors disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {f.isProcessed ? 'Paid' : 'Pay'}
                                                </button>
                                                <button onClick={() => toggleCardBreakdown(f.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeTextSec dark:text-white/50 transition-colors">
                                                    <i className={`fa-solid fa-chevron-down text-xs transition-transform ${expandedCards.includes(f.id) ? 'rotate-180' : ''}`}></i>
                                                </button>
                                            </div>

                                            {/* Expandable Breakdown in List View */}
                                            {expandedCards.includes(f.id) && (
                                                <div className="w-full basis-full mt-2 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-6 animate-fade-in">
                                                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-4">
                                                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Salary Structure</span>
                                                        {f.salary_structure?.map((item, i) => (
                                                            <div key={i} className="flex justify-between text-[10px] font-bold py-1">
                                                                <span className="text-themeText dark:text-white/80">{item.name} ({item.percentage}%)</span>
                                                                <span className="text-themeText dark:text-white font-mono">₹{Math.round(f.basePay * (item.percentage / 100))}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl p-4">
                                                        <span className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-2">Account Details</span>
                                                        <div className="flex flex-col gap-1 text-[10px] font-bold">
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">Bank:</span> <span className="text-themeText dark:text-white">{f.bankDetails?.bankName || 'N/A'}</span></div>
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">Acct:</span> <span className="text-themeText dark:text-white">{f.bankDetails?.accountNo || 'N/A'}</span></div>
                                                            <div className="flex justify-between"><span className="text-themeTextSec dark:text-white/50">IFSC:</span> <span className="text-themeText dark:text-white">{f.bankDetails?.ifsc || 'N/A'}</span></div>
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

            {/* PAYMENT & TAX QUESTIONNAIRE MODAL */}
            {showPaymentModal && selectedFac && createPortal(
                <div className="fixed inset-0 z-[99999] bg-gray-50 dark:bg-[#0A0A0A] flex flex-col animate-fade-in overflow-hidden">
                    <div className="w-full h-full bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex flex-col">
                        
                        <div className="px-6 py-6 lg:px-12 lg:py-8 border-b border-themeBorder dark:border-white/5 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-black text-themeText dark:text-white">Process Payroll</h3>
                                <p className="text-xs lg:text-sm font-bold tracking-widest text-themeTextSec dark:text-white/50 uppercase mt-2">Tax & Transaction Questionnaire for {selectedFac.full_name}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white hover:bg-white/10 transition text-lg">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 flex justify-center">
                            <div className="w-full max-w-3xl flex flex-col gap-8">
                            
                            {/* Salary Breakdown Recap */}
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Calculation Recap</p>
                                <div className="flex justify-between"><span className="text-xs text-amber-500/80">Base Salary</span><span className="text-xs font-bold text-amber-500 font-mono">{formatCurrency(selectedFac.basePay)}</span></div>
                                <div className="flex justify-between"><span className="text-xs text-amber-500/80">LOP Penalty</span><span className="text-xs font-bold text-amber-500 font-mono">-{formatCurrency(selectedFac.deduction)}</span></div>
                                <div className="w-full h-px bg-amber-500/20 my-1"></div>
                                <div className="flex justify-between"><span className="text-sm font-black text-amber-500">Gross Payable</span><span className="text-sm font-black text-amber-500 font-mono">{formatCurrency(selectedFac.netPay)}</span></div>
                            </div>

                            <form id="payment-form" onSubmit={handleConfirmPayment} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Transaction Date *</label>
                                        <input type="date" required value={paymentForm.transactionDate} onChange={e => setPaymentForm({...paymentForm, transactionDate: e.target.value})} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Payment Mode *</label>
                                        <select required value={paymentForm.paymentMode} onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500 appearance-none">
                                            <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Transaction Ref / ID *</label>
                                    <input type="text" required placeholder="e.g. UTR123456789" value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                                </div>

                                <div className="w-full h-px bg-white/5 my-2"></div>
                                
                                <h4 className="text-xs font-black text-themeText dark:text-white tracking-widest uppercase">Statutory Deductions (Section 192)</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">Professional Tax (₹)</label>
                                        <input type="number" required value={paymentForm.professionalTax} onChange={e => setPaymentForm({...paymentForm, professionalTax: Number(e.target.value)})} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest block mb-1">TDS (%)</label>
                                        <input type="number" step="0.1" required value={paymentForm.tdsPercentage} onChange={e => setPaymentForm({...paymentForm, tdsPercentage: Number(e.target.value)})} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="bg-black/5 dark:bg-themeApp p-4 rounded-xl border border-black/[0.04] dark:border-white/[0.08] flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-themeTextSec dark:text-white/50 uppercase tracking-widest">TDS Amount</p>
                                        <p className="text-xs font-medium text-themeTextSec dark:text-white/30">Taxable: {formatCurrency(selectedFac.netPay)}</p>
                                    </div>
                                    <span className="text-sm font-black text-rose-500 font-mono">-{formatCurrency(paymentForm.tdsAmount)}</span>
                                </div>

                                <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 flex justify-between items-center mt-2">
                                    <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Final Post-Tax Disbursal</span>
                                    <span className="text-2xl font-black text-emerald-500 font-mono">{formatCurrency(selectedFac.netPay - paymentForm.professionalTax - paymentForm.tdsAmount)}</span>
                                </div>
                            </form>
                        </div>
                        </div>

                        <div className="p-6 lg:p-8 border-t border-themeBorder dark:border-white/5 bg-white/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex justify-center shrink-0">
                            <div className="w-full max-w-3xl flex justify-end gap-4">
                                <button onClick={() => setShowPaymentModal(false)} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-themeTextSec dark:text-white/50 hover:text-themeText dark:text-white text-sm font-black transition-colors">Cancel</button>
                                <button form="payment-form" type="submit" disabled={isProcessing} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-black text-sm font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isProcessing ? 'Processing...' : <><i className="fa-solid fa-lock"></i> Mark Paid & Generate PDF</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}

        </section>
    );
}
