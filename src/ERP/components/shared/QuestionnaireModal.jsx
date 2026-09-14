/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState } from 'react';
import { theme } from '../../../Shared/theme';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../context/ErpContext';

export default function QuestionnaireModal({ onComplete, onSkip }) {
    const { userSession } = useERP();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        linkedInProfile: '',
        legalInterest: '',
        fatherName: '',
        motherName: '',
        parentOccupation: '',
        pastLegalGenerations: 'No',
        pastLegalGenerationsDetails: '',
        bloodGroup: '',
        presentAddress: '',
        permanentAddress: '',
        sameAsPresentAddress: false,
        aadharNumber: '',
        emergencyContact: '',
        emergencyPhone: '' // Just the 10 digit number
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'sameAsPresentAddress') {
            setFormData(prev => ({
                ...prev,
                sameAsPresentAddress: checked,
                permanentAddress: checked ? prev.presentAddress : prev.permanentAddress
            }));
            return;
        }

        // If phone number or aadhar, only allow numbers
        if (name === 'emergencyPhone' || name === 'aadharNumber') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: onlyNums });
            return;
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // If they change present address and checkbox is checked, update permanent too
            if (name === 'presentAddress' && prev.sameAsPresentAddress) {
                newData.permanentAddress = value;
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validations
        if (formData.emergencyPhone.length !== 10) {
            window.erpDialog.alert("Please enter a valid 10-digit phone number.");
            return;
        }
        if (formData.aadharNumber.length !== 12) {
            window.erpDialog.alert("Aadhar Number must be exactly 12 digits.");
            return;
        }
        if (!formData.linkedInProfile.includes('linkedin.com/')) {
            window.erpDialog.alert("Please enter a valid LinkedIn URL.");
            return;
        }

        setIsLoading(true);

        // Prefix +91 for the final saved data
        const finalData = {
            ...formData,
            emergencyPhone: `+91 ${formData.emergencyPhone}`
        };

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    questionnaire_completed: true,
                    questionnaire_data: finalData
                })
                .eq('id', userSession.db_id);

            if (error) throw error;

            onComplete(finalData);

        } catch (err) {
            console.error("Failed to submit questionnaire:", err);
            window.erpDialog.alert("Submission failed. Please try again or contact IT support.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-3xl bg-themeElevated backdrop-blur-[80px] backdrop-blur-2xl shadow-premium border border-black/10 dark:border-white/20 shadow-premiumElevated rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]`}>
                
                <div className="p-6 md:p-8 border-b-theme border-black/10 dark:border-white/20 flex flex-col gap-2 shrink-0">
                    <div className="w-12 h-12 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner flex items-center justify-center text-themeAccent mb-4 shadow-premiumElevated">
                        <i className="fa-solid fa-clipboard-list text-xl"></i>
                    </div>
                    <h2 className={`${theme.text.heading} text-2xl`}>Comprehensive Onboarding Details</h2>
                    <p className={theme.text.secondary}>
                        Please complete your mandatory institutional records. Once submitted, this record will be <strong className="text-themeText">permanently locked</strong> and can only be modified by Administration.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <form id="questionnaire-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                        
                        {/* Section 1: Academic & Professional Details */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">Academic & Background</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Primary Area of Legal Interest *</label>
                                    <select name="legalInterest" required value={formData.legalInterest} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none">
                                        <option value="" disabled>Select an area of interest</option>
                                        <option value="Corporate Law">Corporate Law</option>
                                        <option value="Criminal Law">Criminal Law</option>
                                        <option value="Constitutional Law">Constitutional Law</option>
                                        <option value="Intellectual Property">Intellectual Property</option>
                                        <option value="Human Rights">Human Rights</option>
                                        <option value="Undecided">Undecided</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">LinkedIn Profile URL *</label>
                                    <input type="url" name="linkedInProfile" required placeholder="https://linkedin.com/in/..." value={formData.linkedInProfile} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Past generations in legal profession? *</label>
                                    <select name="pastLegalGenerations" required value={formData.pastLegalGenerations} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none">
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                {formData.pastLegalGenerations === 'Yes' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-themeText">Please Specify Details *</label>
                                        <input type="text" name="pastLegalGenerationsDetails" required placeholder="e.g., Grandfather was a judge" value={formData.pastLegalGenerationsDetails} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Personal & Identity Details */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">Personal & Identity Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Blood Group *</label>
                                    <select name="bloodGroup" required value={formData.bloodGroup} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none">
                                        <option value="" disabled>Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Aadhar Number *</label>
                                    <input type="text" name="aadharNumber" required maxLength="12" placeholder="12 Digit Aadhar No." value={formData.aadharNumber} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-themeText">Present Address *</label>
                                <textarea name="presentAddress" required rows="2" placeholder="Full residential address" value={formData.presentAddress} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none resize-none"></textarea>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-themeText">Permanent Address *</label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-themeTextSec">
                                        <input type="checkbox" name="sameAsPresentAddress" checked={formData.sameAsPresentAddress} onChange={handleChange} className="accent-themeAccent" />
                                        Same as Present Address
                                    </label>
                                </div>
                                <textarea name="permanentAddress" required rows="2" placeholder="Full permanent address" value={formData.permanentAddress} onChange={handleChange} disabled={formData.sameAsPresentAddress} className={`w-full border border-black/10 dark:border-white/20 rounded-themeBtn px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none resize-none ${formData.sameAsPresentAddress ? 'bg-themeElevated backdrop-blur-[80px] backdrop-blur-2xl shadow-premium opacity-70' : 'bg-themeApp'}`}></textarea>
                            </div>
                        </div>

                        {/* Section 3: Family & Emergency */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">Family & Emergency Contacts</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Father's Name *</label>
                                    <input type="text" name="fatherName" required placeholder="Full Name" value={formData.fatherName} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Mother's Name *</label>
                                    <input type="text" name="motherName" required placeholder="Full Name" value={formData.motherName} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-themeText">Primary Parent/Guardian Occupation *</label>
                                <input type="text" name="parentOccupation" required placeholder="e.g. Business, Government Service, Doctor" value={formData.parentOccupation} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Emergency Contact Name *</label>
                                    <input type="text" name="emergencyContact" required placeholder="e.g. John Doe (Father)" value={formData.emergencyContact} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-themeText">Emergency Contact Phone *</label>
                                    <div className="flex">
                                        <span className="bg-themeElevated backdrop-blur-[80px] backdrop-blur-2xl shadow-premium border border-black/10 dark:border-white/20 border-r-0 rounded-l-themeBtn px-4 py-3 text-themeTextSec flex items-center select-none font-mono">+91</span>
                                        <input type="text" name="emergencyPhone" required maxLength="10" placeholder="9876543210" value={formData.emergencyPhone} onChange={handleChange} className="w-full bg-themeApp border border-black/10 dark:border-white/20 rounded-r-themeBtn px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none font-mono" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 md:p-8 border-t-theme border-black/10 dark:border-white/20 bg-themeApp shrink-0 flex items-center justify-between">
                    <p className="text-xs text-themeTextSec">
                        <i className="fa-solid fa-lock mr-2 text-themeAccent"></i>
                        Record will be locked upon submission.
                    </p>
                    <div className="flex gap-4">
                        {onSkip && (<button type="button" onClick={onSkip} className="px-6 py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white transition-colors">
                            Skip for now
                        </button>)}
                        <button type="submit" form="questionnaire-form" disabled={isLoading || formData.emergencyPhone.length !== 10 || formData.aadharNumber.length !== 12 || !formData.linkedInProfile.includes('linkedin.com/')} className={`${theme.action.btnPrimary} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isLoading ? (
                                <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</>
                            ) : (
                                <><i className="fa-solid fa-check"></i> Submit & Lock Record</>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
