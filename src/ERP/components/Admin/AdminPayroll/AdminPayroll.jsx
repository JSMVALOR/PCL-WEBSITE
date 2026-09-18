/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import LuxuryPayslipTemplate from '../../../DocumentTemplates/LuxuryPayslipTemplate';
import { generateComponentPDF } from '../../../DocumentTemplates/pdfEngine';
import { generateNativePayslip } from '../../../DocumentTemplates/NativePayslipEngine';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

import { sendSystemEmail } from '../../../lib/EmailService';
import { QRCodeSVG } from 'qrcode.react';


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
    
    // Luxury PDF Engine Refs & State
    const payslipRef = useRef(null);
    const [pdfPayload, setPdfPayload] = useState(null);

    const luxuryPayslipRef = React.useRef(null);
    const [currentPayload, setCurrentPayload] = React.useState(null);

    useEffect(() => {
        const loadConfig = async () => {
            const { data } = await supabase.from('system_settings').select('value').eq('key', 'payroll_config').maybeSingle();
            if (data?.value) setConfig({ ...config, ...data.value, breakdown: data.value.breakdown || config.breakdown });
        };
        loadConfig();
    }, []);

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await supabase.from('system_settings').upsert({ key: 'payroll_config', value: config });
            window.erpDialog?.alert("✅ Policy Engine updated successfully.");
        } catch (e) {
            console.error(e);
            window.erpDialog?.alert("Failed to save policy.");
        } finally {
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
            const { data: facultyData } = await supabase.from('profiles').select('*').eq('role', 'faculty');
            
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
                    .select('faculty_id, start_date, end_date')
                    .eq('status', 'approved')
                    .gte('start_date', currentMonthStart.toISOString().split('T')[0]);

                const { data: attendanceLogs } = await supabase
                    .from('faculty_attendance_log')
                    .select('faculty_id, date, status')
                    .eq('status', 'absent')
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
                        let start = new Date(l.start_date);
                        let end = new Date(l.end_date);
                        if (start < currentMonthStart) start = currentMonthStart;
                        if (end >= start) {
                            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                            totalLeaveDays += diff;
                        }
                    });

                    // Add manually enforced Admin absences
                    const enforcedAbsences = (attendanceLogs || []).filter(log => log.faculty_id === f.id).length;
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
                        if (f.payment_details) bankDetails = typeof f.payment_details === 'string' ? JSON.parse(f.payment_details) : f.payment_details;
                    } catch (e) {}

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
        const confirmed = await window.erpDialog?.confirm(
            "Are you sure you want to finalize this payroll disbursal? This action will generate the encrypted PDF and cannot be undone.", 
            "Finalize Disbursal"
        );
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

            // 1. Sync payload to state so the hidden HTML template renders it
            setPdfPayload(payload);
            
            // 2. Wait 100ms for React to mount the hidden template DOM
            await new Promise(r => setTimeout(r, 100));

            // 3. Database Insert
            const { error } = await supabase.from('faculty_payroll').insert([payload]);
            if (error) throw error;

            // 4. Generate Ultra Luxury PDF via NATIVE ENGINE (Zero DOM Dependency)
            const base64Pdf = await generateNativePayslip(
                payload, 
                selectedFac.full_name, 
                selectedFac.erp_id,
                "Faculty of Law"
            );

            // 5. Download the PDF directly for the Admin
            const linkSource = `data:application/pdf;base64,${base64Pdf}`;
            const downloadLink = document.createElement("a");
            downloadLink.href = linkSource;
            downloadLink.download = `Payslip_${selectedFac.full_name}_${payload.month}.pdf`;
            downloadLink.click();

            // 6. Optional: Email Dispatch
            await sendSystemEmail('PAYROLL_DISBURSAL', {
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
            
            window.erpDialog?.alert("✅ Payment processed & Recorded. Ultra Luxury Encrypted PDF Generated.");
            setShowPaymentModal(false);

        } catch (err) {
            console.error(err);
            window.erpDialog?.alert('Failed to process payment.');
        } finally {
            setIsProcessing(false);
            setPdfPayload(null);
        }
    };

    return (
        <div className="w-full animate-fade-in pb-12">
            
            {/* INVISIBLE PDF TEMPLATE RENDERER */}
            <div className="absolute opacity-0 pointer-events-none -z-50" style={{ top: '-9999px', left: '-9999px' }}>
                <LuxuryPayslipTemplate ref={payslipRef} faculty={selectedFac} payload={pdfPayload} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                
                {/* CONFIGURATION PANEL */}
                <div className="lg:col-span-1 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col h-fit">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Policy Engine</h2>
                    <p className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest mb-6">Automated LOP Criteria</p>
                    
                    <div className="flex flex-col gap-5 flex-1">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Standard Base Pay (₹)</label>
                            <input 
                                type="number" 
                                value={config.defaultBasePay} 
                                onChange={e => setConfig({...config, defaultBasePay: Number(e.target.value)})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Allowed Paid Leaves / Month</label>
                            <input 
                                type="number" 
                                value={config.allowedPaidLeaves} 
                                onChange={e => setConfig({...config, allowedPaidLeaves: Number(e.target.value)})}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 transition-colors" 
                            />
                        </div>
                        
                        {/* Dynamic Breakdown */}
                        

                        <button 
                            onClick={handleSaveConfig}
                            disabled={isSavingConfig}
                            className="w-full py-3.5 mt-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-900 dark:text-white text-xs font-black transition-colors disabled:opacity-50"
                        >
                            {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                        </button>

                    </div>
                </div>

                {/* FACULTY ROSTER CARDS */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Faculty Payroll Cards</h2>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Current Month
                        </span>
                    </div>

                    {loading ? (
                        <div className="w-full py-12 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {faculty.map(f => (
                                <div key={f.id} className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group">
                                    {f.isProcessed && (
                                        <div className="absolute top-4 right-4 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Paid
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-4">
                                        {f.avatar_url ? (
                                            <img src={f.avatar_url} alt={f.full_name} className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-white/10 shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/50 flex items-center justify-center font-black text-lg shadow-sm">
                                                {f.full_name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-base font-black text-gray-900 dark:text-white">{f.full_name}</h4>
                                            <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">{f.erp_id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white dark:bg-[#121212] rounded-xl p-4 border border-gray-200 dark:border-white/5">
                                        <div className="flex flex-col mb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Gross Base Salary (Editable)</span>
                                                    <button onClick={() => toggleCardBreakdown(f.id)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:text-white transition-colors">
                                                        <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${expandedCards.includes(f.id) ? 'rotate-180' : ''}`}></i>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 font-bold">₹</span>
                                                    <input 
                                                        type="number"
                                                        value={f.basePay}
                                                        onChange={(e) => handleFacultyPropUpdate(f.id, 'basePay', e.target.value)}
                                                        className="bg-transparent border-b border-gray-300 dark:border-white/20 text-sm font-black text-gray-900 dark:text-white font-mono w-24 outline-none focus:border-amber-500 transition-colors py-0.5"
                                                    />
                                                </div>
                                            </div>
                                            {/* Personalized Salary Breakdown (Editable) */}
                                            {expandedCards.includes(f.id) && (
                                                <div className="flex flex-col gap-2 pl-3 border-l border-gray-300 dark:border-white/10 ml-1.5 mt-3 mb-2 animate-fade-in bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex justify-between items-center border-b border-gray-300 dark:border-white/10 pb-1">
                                                        <span>Personalized Pay Structure</span>
                                                        <button onClick={() => {
                                                            setFaculty(prev => prev.map(fac => fac.id === f.id ? { ...fac, salary_structure: [...(fac.salary_structure || []), { name: 'New Component', percentage: 0 }] } : fac));
                                                        }} className="text-amber-500 hover:text-amber-600 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                            <i className="fa-solid fa-plus"></i> Add
                                                        </button>
                                                    </div>
                                                    {(f.salary_structure || []).map((b, i) => (
                                                        <div key={i} className="flex gap-2 items-center group">
                                                            <input type="text" value={b.name} onChange={e => handleUpdateStructure(f.id, i, 'name', e.target.value)} className="w-full flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-amber-500 text-[10px] font-bold text-gray-600 dark:text-white/70 outline-none transition-colors" />
                                                            <div className="flex items-center bg-black/5 dark:bg-white/5 rounded px-1">
                                                                <input type="number" value={b.percentage} onChange={e => handleUpdateStructure(f.id, i, 'percentage', e.target.value)} className="w-8 bg-transparent text-xs font-black text-amber-500 outline-none text-right" />
                                                                <span className="text-[10px] text-amber-500/50 ml-0.5">%</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 group/amt border-b border-transparent hover:border-gray-300 focus-within:border-amber-500 transition-colors px-1">
                                                                <span className="text-[10px] text-gray-400 font-bold">₹</span>
                                                                <input 
                                                                    type="number" 
                                                                    value={Math.round(f.basePay * (b.percentage / 100))}
                                                                    onChange={e => handleUpdateStructure(f.id, i, 'percentage', (Number(e.target.value) / f.basePay) * 100)}
                                                                    className="w-14 bg-transparent text-[10px] font-medium text-gray-500 dark:text-white/50 font-mono text-right outline-none"
                                                                />
                                                            </div>
                                                            <button onClick={() => {
                                                                setFaculty(prev => prev.map(fac => fac.id === f.id ? { ...fac, salary_structure: fac.salary_structure.filter((_, idx) => idx !== i) } : fac));
                                                            }} className="text-rose-500/0 group-hover:text-rose-500/50 hover:!text-rose-500 transition-colors w-4 text-center">
                                                                <i className="fa-solid fa-xmark text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300 dark:border-white/10">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Weight:</span>
                                                        <span className={`text-[10px] font-black ${(f.salary_structure || []).reduce((acc, curr) => acc + Number(curr.percentage || 0), 0) === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {(f.salary_structure || []).reduce((acc, curr) => acc + Number(curr.percentage || 0), 0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Preferred Account</span>
                                            <span className="text-[11px] font-bold text-white/80">{f.bankDetails.bankName} (..{f.bankDetails.accountNo?.slice(-4) || 'N/A'})</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Leaves (Total/LOP)</span>
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
                                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-xs font-black transition-colors"
                                        >
                                            Process Payment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PAYMENT & TAX QUESTIONNAIRE MODAL */}
            {showPaymentModal && selectedFac && (
                <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-[#0A0A0A] flex flex-col animate-fade-in overflow-hidden">
                    <div className="w-full h-full bg-white dark:bg-[#121212] flex flex-col">
                        
                        <div className="px-6 py-6 lg:px-12 lg:py-8 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#121212] flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Process Payroll</h3>
                                <p className="text-xs lg:text-sm font-bold tracking-widest text-gray-500 dark:text-white/50 uppercase mt-2">Tax & Transaction Questionnaire for {selectedFac.full_name}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white hover:bg-white/10 transition text-lg">
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
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Transaction Date *</label>
                                        <input type="date" required value={paymentForm.transactionDate} onChange={e => setPaymentForm({...paymentForm, transactionDate: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Payment Mode *</label>
                                        <select required value={paymentForm.paymentMode} onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 appearance-none">
                                            <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Transaction Ref / ID *</label>
                                    <input type="text" required placeholder="e.g. UTR123456789" value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                                </div>

                                <div className="w-full h-px bg-white/5 my-2"></div>
                                
                                <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-widest uppercase">Statutory Deductions (Section 192)</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">Professional Tax (₹)</label>
                                        <input type="number" required value={paymentForm.professionalTax} onChange={e => setPaymentForm({...paymentForm, professionalTax: Number(e.target.value)})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">TDS (%)</label>
                                        <input type="number" step="0.1" required value={paymentForm.tdsPercentage} onChange={e => setPaymentForm({...paymentForm, tdsPercentage: Number(e.target.value)})} className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="bg-gray-100 dark:bg-[#1A1A1A] p-4 rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">TDS Amount</p>
                                        <p className="text-xs font-medium text-gray-400 dark:text-white/30">Taxable: {formatCurrency(selectedFac.netPay)}</p>
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

                        <div className="p-6 lg:p-8 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#121212] flex justify-center shrink-0">
                            <div className="w-full max-w-3xl flex justify-end gap-4">
                                <button onClick={() => setShowPaymentModal(false)} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white text-sm font-black transition-colors">Cancel</button>
                                <button form="payment-form" type="submit" disabled={isProcessing} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-black text-sm font-black transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {isProcessing ? 'Processing...' : <><i className="fa-solid fa-lock"></i> Mark Paid & Generate PDF</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ULTRA LUXURY PAYSLIP TEMPLATE */}
            {currentPayload && selectedFac && (
                <div className="hidden">
                    <div ref={luxuryPayslipRef} className="w-[800px] h-[1131px] bg-white text-black p-8 flex flex-col justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
                        
                        <div>
                            {/* 1. Header (Institution Identity) */}
                            <div className="flex justify-between items-center border-b-[1px] border-[#d4af37] pb-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center text-[#d4af37]">
                                        <span className="font-black text-xl tracking-tighter leading-none">PCL</span>
                                        <span className="text-[6px] tracking-widest uppercase">Prudentia</span>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a]">Sri Vidya Law College</h1>
                                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mt-1">NAAC Accredited | BCI Approved</p>
                                        <p className="text-[9px] text-gray-400 mt-1">123 Legal Avenue, Knowledge Park, Hyderabad</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black tracking-widest uppercase text-[#d4af37]">Faculty Payslip</h2>
                                    <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mt-1">{currentPayload.month} {currentPayload.year}</p>
                                    <p className="text-[9px] text-gray-400 mt-1">hr@prudentiacollege.edu | www.prudentiacollege.edu</p>
                                </div>
                            </div>

                            {/* 2. Employee Information */}
                            <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Employee ID</p>
                                    <p className="text-xs font-black">{selectedFac.erp_id || "FAC-XXXX"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                    <p className="text-xs font-black">{selectedFac.department || "School of Law"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Employee Name</p>
                                    <p className="text-xs font-black">{selectedFac.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Designation</p>
                                    <p className="text-xs font-black">{selectedFac.role === 'admin' ? 'Administrator' : 'Faculty Member'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">PAN Number</p>
                                    <p className="text-xs font-black">{selectedFac.pan_number || "ABCDE1234F"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">UAN Number</p>
                                    <p className="text-xs font-black">{selectedFac.uan_number || "100512345678"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Account</p>
                                    <p className="text-xs font-black">{selectedFac.bankDetails?.account_number || "XXXX6789"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Joining</p>
                                    <p className="text-xs font-black">{selectedFac.date_of_joining ? new Date(selectedFac.date_of_joining).toLocaleDateString('en-GB') : "12 Jul 2022"}</p>
                                </div>
                            </div>

                            {/* 3. Payroll Summary */}
                            <div className="flex justify-between items-center mb-6 px-4">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Salary Credit Date</p>
                                    <p className="text-sm font-black">{new Date(currentPayload.transaction_date).toLocaleDateString('en-GB')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Working Days</p>
                                    <p className="text-sm font-black">30</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Days Paid</p>
                                    <p className="text-sm font-black">{30 - (selectedFac.lopDays || 0)}</p>
                                </div>
                            </div>

                            {/* 4 & 5. Earnings & Deductions Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {/* Earnings */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b border-gray-200 pb-2 text-[#1a1a1a]">Earnings</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Basic Pay</span><span className="font-bold">₹{(currentPayload.base_pay || 50000).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Dearness Allowance (DA)</span><span className="font-bold">₹{(currentPayload.base_pay * 0.40).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">House Rent Allowance (HRA)</span><span className="font-bold">₹{(currentPayload.base_pay * 0.50).toLocaleString('en-IN')}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Conveyance Allowance</span><span className="font-bold">₹3,200</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Medical Allowance</span><span className="font-bold">₹2,000</span></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-black mt-4 pt-3 border-t border-gray-200">
                                        <span className="uppercase tracking-widest">Gross Earnings (A)</span>
                                        <span>₹{(currentPayload.base_pay * 1.9 + 5200).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest mb-3 border-b border-gray-200 pb-2 text-[#1a1a1a]">Deductions</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Provident Fund (PF)</span><span className="font-bold">₹6,000</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Professional Tax</span><span className="font-bold">₹{currentPayload.professional_tax}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Income Tax (TDS)</span><span className="font-bold">₹{currentPayload.tds_deducted}</span></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-600">Loss of Pay (LOP)</span><span className="font-bold">₹{(selectedFac.deduction || 0).toLocaleString('en-IN')}</span></div>
                                    </div>
                                    <div className="flex justify-between text-xs font-black mt-4 pt-3 border-t border-gray-200">
                                        <span className="uppercase tracking-widest">Total Deductions (B)</span>
                                        <span>₹{(6000 + currentPayload.professional_tax + currentPayload.tds_deducted + (selectedFac.deduction || 0)).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 6. Net Salary Hero Section */}
                            <div className="w-full bg-[#1a1a1a] text-white rounded-2xl p-8 flex justify-between items-center relative overflow-hidden mb-8">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#2c2c2c]"></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest mb-2">Net Salary</p>
                                    <h1 className="text-5xl font-black tracking-tighter">₹{currentPayload.final_net_pay.toLocaleString('en-IN')}</h1>
                                    <p className="text-xs text-gray-400 mt-2 font-mono uppercase">Bank Ref: {currentPayload.transaction_id || 'AUTO-GEN-NEFT'}</p>
                                </div>
                                <div className="relative z-10 text-right">
                                    <p className="text-xs font-bold text-gray-300">Gross: ₹{(currentPayload.base_pay * 1.9 + 5200).toLocaleString('en-IN')}</p>
                                    <p className="text-xs font-bold text-gray-300 mt-1">Deductions: ₹{(6000 + currentPayload.professional_tax + currentPayload.tds_deducted + (selectedFac.deduction || 0)).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* 7 & 9. Leave & Tax Summary */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-400">Leave Balance (YTD)</h3>
                                    <div className="flex justify-between text-xs border-b border-gray-100 py-2"><span className="font-semibold text-gray-600">Casual Leave</span><span className="font-black">6 / 12</span></div>
                                    <div className="flex justify-between text-xs border-b border-gray-100 py-2"><span className="font-semibold text-gray-600">Earned Leave</span><span className="font-black">8 / 24</span></div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-400">Tax Information (YTD)</h3>
                                    <div className="flex justify-between text-xs border-b border-gray-100 py-2"><span className="font-semibold text-gray-600">Gross YTD</span><span className="font-black">₹6,42,000</span></div>
                                    <div className="flex justify-between text-xs border-b border-gray-100 py-2"><span className="font-semibold text-gray-600">TDS YTD</span><span className="font-black">₹52,500</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Sections: Notes, Auth, Footer */}
                        <div>
                            {/* 10. Notes */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-[9px] font-medium text-gray-500 leading-relaxed">
                                    • This is a system-generated payslip and does not require a physical signature.<br/>
                                    • Salary has been credited to the registered bank account ending in {selectedFac.bankDetails?.account_number?.slice(-4) || "6789"}.<br/>
                                    • Income tax has been deducted as per applicable laws. Any discrepancy must be reported within 7 working days.
                                </p>
                            </div>

                            {/* 11. Authentication */}
                            <div className="flex justify-between items-end border-t border-gray-200 pt-6 mb-8">
                                <div className="flex gap-12">
                                    <div className="text-center">
                                        <div className="w-32 border-b border-gray-300 pb-8 mb-2"></div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Finance Controller</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-32 border-b border-gray-300 pb-8 mb-2"></div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Registrar</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Document ID</p>
                                        <p className="text-[10px] font-mono font-black">SVLC-PS-2026-{currentPayload.faculty_id.substring(0, 4)}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-2 mb-1">Generated On</p>
                                        <p className="text-[9px] font-mono font-black">{new Date().toLocaleString('en-GB')}</p>
                                    </div>
                                    <div className="w-16 h-16 border-4 border-[#d4af37] p-1 rounded-lg">
                                        <QRCodeSVG value={`VERIFY: SVLC-PS-2026-${currentPayload.faculty_id.substring(0, 4)}`} size={50} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* 12. Footer */}
                            <div className="w-full bg-[#1a1a1a] text-white text-[8px] uppercase tracking-widest font-black py-4 px-6 flex justify-between rounded-lg">
                                <span>Prudentia College of Law</span>
                                <span className="text-[#d4af37]">Confidential Document</span>
                                <span>ERP Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
