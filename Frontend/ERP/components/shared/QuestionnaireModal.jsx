/* © 2026 JSM VALOR. All Rights Reserved. */
/* eslint-disable */
import React, { useState } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../context/ErpContext';

export default function QuestionnaireModal({ onComplete, onSkip }) {
    const { userSession } = useERP();
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        dob: '',
        gender: '',
        nationality: 'Indian',
        phone: '',
        personalEmail: '',
        linkedInProfile: '',
        legalInterest: '',
        careerGoal: '',
        extracurriculars: [],
        skills: [],
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
        emergencyRelation: '',
        emergencyPhone: '', // Just the 10 digit number
        highestQualification: '',
        specialization: '',
        yearsOfExperience: '',
        previousInstitution: ''
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

    const handleCheckboxChange = (field, val) => {
        setFormData(prev => {
            const arr = prev[field] || [];
            if (arr.includes(val)) {
                return { ...prev, [field]: arr.filter(i => i !== val) };
            } else {
                return { ...prev, [field]: [...arr, val] };
            }
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
            emergencyPhone: `+91 ${formData.emergencyPhone}`,
            personalEmail: formData.personalEmail,
            currentAddress: formData.presentAddress,
            emergencyName: formData.emergencyContact,
            emergencyRelation: formData.emergencyRelation
        };

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    questionnaire_completed: true,
                    questionnaire_data: finalData,
                    dob: formData.dob || null,
                    gender: formData.gender || null,
                    nationality: formData.nationality || 'Indian',
                    phone: formData.phone || null,
                    blood_group: formData.bloodGroup || null
                })
                .eq('id', userSession.db_id)
                .select()
                .single();

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
        <div className="fixed inset-0 z-[9999] bg-themeApp animate-fade-in flex flex-col overflow-hidden">
            {/* Immersive Top Bar */}
            <div className="px-6 py-6 lg:px-12 lg:py-8 border-b border-black/5 dark:border-white/5 bg-themePanel/50 backdrop-blur-2xl flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-themeText tracking-tight">Comprehensive Onboarding</h3>
                    <p className="text-xs lg:text-sm font-bold tracking-widest text-themeAccent uppercase mt-2">Institutional Records Synchronization</p>
                </div>
                <div className="w-12 h-12 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-full shadow-inner flex items-center justify-center text-themeAccent shadow-premiumElevated">
                    <i className="fa-solid fa-clipboard-list text-xl"></i>
                </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 flex justify-center bg-gray-50 dark:bg-[#0A0A0A]">
                <div className="w-full max-w-4xl flex flex-col gap-8">
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex flex-col gap-2">
                        <h4 className="text-amber-500 font-bold flex items-center gap-2"><i className="fa-solid fa-lock"></i> Mandatory Record Lock</h4>
                        <p className="text-sm font-medium text-themeTextSec leading-relaxed">
                            Please complete your mandatory institutional records accurately. Once submitted, this record will be <strong>permanently locked</strong> to your ERP ID and can only be modified by the Central Administration.
                        </p>
                    </div>

                    <form id="questionnaire-form" onSubmit={handleSubmit} className="flex flex-col gap-10 bg-themePanel/85 backdrop-blur-2xl p-8 lg:p-12 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl">
                        
                        {/* Section 0: Personal & Contact Information */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold tracking-normal text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">Personal & Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Date of Birth</label>
                                    <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Gender</label>
                                    <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Nationality</label>
                                    <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition" placeholder="Indian" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Mobile Number</label>
                                    <input type="tel" name="phone" required minLength={10} maxLength={10} value={formData.phone} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition" placeholder="10-digit mobile number" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Personal Email</label>
                                    <input type="email" name="personalEmail" required value={formData.personalEmail} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition" placeholder="Personal Email ID" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Name</label>
                                    <input type="text" name="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition" placeholder="Full Name" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Emergency Contact Relation</label>
                                    <input type="text" name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} className="w-full bg-black/5 dark:bg-themeApp border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white outline-none focus:border-themeAccent transition" placeholder="e.g. Father, Mother, Guardian" />
                                </div>
                            </div>
                        </div>

                        {/* Section 1: Academic & Professional Details */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold tracking-normal text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">Academic & Professional Background</h3>
                            
                            {userSession?.role === 'faculty' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-themeText">Highest Qualification *</label>
                                            <select name="highestQualification" required value={formData.highestQualification} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none">
                                                <option value="" disabled>Select highest qualification</option>
                                                <option value="Ph.D.">Ph.D.</option>
                                                <option value="LL.M.">LL.M.</option>
                                                <option value="LL.B.">LL.B.</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-themeText">Specialization / Area of Expertise *</label>
                                            <input type="text" name="specialization" required placeholder="e.g., Constitutional Law" value={formData.specialization} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-themeText">Years of Experience *</label>
                                            <input type="number" min="0" name="yearsOfExperience" required placeholder="e.g., 5" value={formData.yearsOfExperience} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                        </div>
                                        <div className="flex flex-col gap-2 col-span-2">
                                            <label className="text-sm font-semibold text-themeText">Previous Institution / Organization *</label>
                                            <input type="text" name="previousInstitution" required placeholder="e.g., National Law University" value={formData.previousInstitution} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-themeText">LinkedIn Profile URL *</label>
                                        <input type="url" name="linkedInProfile" required placeholder="https://linkedin.com/in/..." value={formData.linkedInProfile} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none" />
                                    </div>
                                </>
                            ) : (
                                <>
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
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-themeText">Primary Career Goal *</label>
                                        <select name="careerGoal" required value={formData.careerGoal} onChange={handleChange} className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl shadow-inner px-4 py-3 text-themeText focus:border-themeAccent focus:ring-1 focus:ring-themeAccent outline-none">
                                            <option value="" disabled>Select your goal</option>
                                            <option value="Independent Practice / Litigation">Independent Practice / Litigation</option>
                                            <option value="Corporate Counsel / Law Firm">Corporate Counsel / Law Firm</option>
                                            <option value="Judiciary">Judiciary</option>
                                            <option value="Civil Services / Government">Civil Services / Government</option>
                                            <option value="Academia / Research">Academia / Research</option>
                                            <option value="Undecided">Undecided</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-2">
                                        <label className="text-sm font-semibold text-themeText">Clubs & Co-curricular Interests</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Moot Court Society", "Debate Society", "Legal Aid Clinic", "ADR Cell", "Research Centers", "Cultural Club", "Sports"].map(club => (
                                                <label key={club} className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] px-4 py-2.5 rounded-xl cursor-pointer hover:border-themeAccent/50 transition-colors">
                                                    <input type="checkbox" checked={formData.extracurriculars.includes(club)} onChange={() => handleCheckboxChange('extracurriculars', club)} className="accent-themeAccent w-4 h-4" />
                                                    <span className="text-xs font-bold text-themeTextSec">{club}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-2">
                                        <label className="text-sm font-semibold text-themeText">Technical & Practical Skills</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Legal Research & Drafting", "Client Counseling", "Negotiation & Mediation", "AI & Legal Tech", "Public Speaking", "Data Analysis"].map(skill => (
                                                <label key={skill} className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] px-4 py-2.5 rounded-xl cursor-pointer hover:border-themeAccent/50 transition-colors">
                                                    <input type="checkbox" checked={formData.skills.includes(skill)} onChange={() => handleCheckboxChange('skills', skill)} className="accent-themeAccent w-4 h-4" />
                                                    <span className="text-xs font-bold text-themeTextSec">{skill}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Section 2: Personal & Identity Details */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold tracking-normal text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">Personal & Identity Details</h3>
                            
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
                            <h3 className="text-sm font-bold tracking-normal text-themeAccent border-b-theme border-black/10 dark:border-white/20 pb-2">{userSession?.role === 'faculty' ? 'Emergency Contact' : 'Family & Emergency Contacts'}</h3>

                            {userSession?.role !== 'faculty' && (
                                <>
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
                                </>
                            )}

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
            </div>

            {/* Floating Action Footer */}
            <div className="p-6 lg:p-8 border-t border-black/5 dark:border-white/5 bg-themePanel/85 backdrop-blur-2xl flex justify-center shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-20">
                <div className="w-full max-w-4xl flex items-center justify-between">
                    <p className="text-xs font-bold text-themeTextSec uppercase tracking-widest hidden sm:block">
                        <i className="fa-solid fa-shield-halved mr-2 text-themeAccent"></i> Encrypted Sync
                    </p>
                    <div className="flex gap-4">
                        {onSkip && (
                            <button type="button" onClick={onSkip} className="px-8 py-4 rounded-2xl text-xs font-bold text-themeTextSec hover:bg-black/5 dark:hover:bg-white/5 transition-colors uppercase tracking-widest">
                                Skip for now
                            </button>
                        )}
                        <button type="submit" form="questionnaire-form" disabled={isLoading || formData.emergencyPhone.length !== 10 || formData.aadharNumber.length !== 12 || !formData.linkedInProfile.includes('linkedin.com/')} className="px-8 py-4 bg-themeAccent hover:opacity-90 rounded-2xl text-themeApp text-sm font-black transition-colors flex items-center gap-3 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-themeAccent/20">
                            {isLoading ? (
                                <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Syncing...</>
                            ) : (
                                <><i className="fa-solid fa-lock text-lg"></i> Lock & Submit</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
