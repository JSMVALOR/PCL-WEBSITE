/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

export default function AdminUserEditorModal({ user, isOpen, onClose, onUpdate }) {
    const [activeTab, setActiveTab] = useState('master'); // master, kyc, faculty
    const [formData, setFormData] = useState({
        full_name: '',
        erp_id: '',
        email: '',
        academic_batch: '',
        section: '',
        department: '',
        phone: '',
        blood_group: '',
        dob: '',
        
        // Questionnaire Data (KYC & Confidential)
        aadhar: '',
        bank_account: '',
        present_address: '',
        permanent_address: '',
        father_name: '',
        mother_name: '',
        past_legal_generations: '',
        legal_interest: '',
        
        // Faculty specific
        designation: '',
        specialisation: '',
        image_url: '',
        bio: '',
        research: '',
        is_public: true
    });
    
    const [isSaving, setIsSaving] = useState(false);

    // Image Upload / Crop States
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    useEffect(() => {
        const fetchExtraDetails = async () => {
            if (user && isOpen) {
                try {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.db_id).single();
                    
                    if (!profile) return;

                    const qData = profile.questionnaire_data || {};

                    let initialData = {
                        full_name: profile.full_name || '',
                        erp_id: profile.erp_id || '',
                        email: profile.email || '',
                        academic_batch: profile.academic_batch || '',
                        section: profile.section || '',
                        department: profile.department || '',
                        phone: profile.phone || '',
                        blood_group: profile.blood_group || qData.bloodGroup || '',
                        dob: profile.dob || '',
                        
                        aadhar: qData.aadharNumber || qData.aadhar || '',
                        bank_name: qData.bankName || qData.bank_name || '',
                        bank_account: qData.bankAccount || qData.bank_account || '',
                        bank_ifsc: qData.bankIfsc || qData.bank_ifsc || '',
                        present_address: qData.presentAddress || qData.present_address || '',
                        permanent_address: qData.permanentAddress || qData.permanent_address || '',
                        father_name: qData.fatherName || qData.father_name || '',
                        mother_name: qData.motherName || qData.mother_name || '',
                        past_legal_generations: qData.pastLegalGenerations || qData.past_legal_generations || '',
                        legal_interest: qData.legalInterest || qData.legal_interest || '',

                        designation: '',
                        specialisation: '',
                        image_url: profile.profile_picture_url || user.avatar_url || '',
                        bio: '',
                        research: '',
                        is_public: true
                    };

                    if (user.role === 'faculty') {
                        const { data: facData } = await supabase.from('faculty_profiles').select('*').eq('id', user.db_id).maybeSingle();
                        if (facData) {
                            initialData.designation = facData.designation || '';
                            initialData.specialisation = facData.specialisation || '';
                            initialData.image_url = facData.image_url || initialData.image_url;
                            initialData.bio = facData.bio || '';
                            initialData.research = facData.research ? (Array.isArray(facData.research) ? facData.research.join(', ') : facData.research) : '';
                            initialData.is_public = facData.is_public !== undefined ? facData.is_public : true;
                        }
                    }
                    
                    setFormData(initialData);
                } catch (e) {
                    console.error(e);
                    if (window.erpToast) window.erpToast.show("An error occurred loading profile data.", "error");
                }
            }
        };
        fetchExtraDetails();
    }, [user, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalVal = type === 'checkbox' ? checked : value;
        
        if (name === 'phone') finalVal = value.replace(/\D/g, '').slice(0, 10);
        if (name === 'aadhar') finalVal = value.replace(/\D/g, '').slice(0, 12);
        
        setFormData(prev => ({ ...prev, [name]: finalVal }));
    };

    // Image Handlers
    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const loadCurrentPhotoForCrop = async () => {
        if (!formData.image_url) return;
        try {
            const response = await fetch(formData.image_url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setImgSrc(objectUrl);
            setCrop(undefined);
        } catch (err) {
            console.error(err);
            alert("Could not load current image for cropping due to CORS or network error.");
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerAspectCrop(width, height, 1);
        setCrop(initialCrop);
        setCompletedCrop(initialCrop);
    };

    const getCroppedImg = async (image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
        
        return new Promise((resolve) => {
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        
        try {
            let finalImageUrl = formData.image_url;

            // Handle Image Upload
            if (completedCrop && completedCrop.width && completedCrop.height && imgRef.current) {
                const blob = await getCroppedImg(imgRef.current, completedCrop);
                if (blob) {
                    const fileName = `user_${user.db_id}_${Date.now()}.jpg`;
                    const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });
                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                        finalImageUrl = publicUrl;
                    } else {
                        throw new Error(`Avatar Upload Failed: ${uploadError.message || JSON.stringify(uploadError)}. Please run the missing SQL command to fix bucket permissions.`);
                    }
                }
            }

            // Fetch the current profile to merge existing questionnaire_data
            const { data: currentProfile } = await supabase.from('profiles').select('questionnaire_data').eq('id', user.db_id).single();
            const existingQData = currentProfile?.questionnaire_data || {};

            const qData = {
                ...existingQData,
                aadharNumber: formData.aadhar,
                bankName: formData.bank_name,
                bankAccount: formData.bank_account,
                bankIfsc: formData.bank_ifsc,
                presentAddress: formData.present_address,
                permanentAddress: formData.permanent_address,
                fatherName: formData.father_name,
                motherName: formData.mother_name,
                pastLegalGenerations: formData.past_legal_generations,
                legalInterest: formData.legal_interest
            };

            const profilePayload = {
                full_name: formData.full_name,
                erp_id: formData.erp_id,
                email: formData.email,
                phone: formData.phone,
                blood_group: formData.blood_group,
                profile_picture_url: finalImageUrl,
                questionnaire_data: qData
            };

            if (user.role === 'student') {
                profilePayload.academic_batch = formData.academic_batch;
                profilePayload.section = formData.section;
            } else {
                profilePayload.department = formData.department;
            }

            if (formData.dob) profilePayload.dob = formData.dob;

            const { error: profileError } = await supabase.from('profiles').update(profilePayload).eq('id', user.db_id);
            if (profileError) throw profileError;

            // Update Faculty Profile
            if (user.role === 'faculty') {
                const researchArray = formData.research.split(',').map(s => s.trim()).filter(Boolean);
                const { error: facError } = await supabase.from('faculty_profiles').upsert({
                    id: user.db_id,
                    designation: formData.designation,
                    specialisation: formData.specialisation,
                    image_url: finalImageUrl,
                    bio: formData.bio,
                    research: researchArray,
                    is_public: formData.is_public,
                    phone: formData.phone
                }, { onConflict: 'id' });
                if (facError) throw facError;
            }
            
            if (window.toast && typeof window.toast.success === 'function') {
                window.toast.success("User details updated successfully!");
            } else if (window.erpToast && typeof window.erpToast.success === 'function') {
                window.erpToast.success("User details updated successfully!");
            } else if (window.erpDialog && typeof window.erpDialog.alert === 'function') {
                window.erpDialog.alert("User details updated successfully!", "Success", false);
            } else {
                alert("User details updated successfully!");
            }
            
            onUpdate();
            onClose();
        } catch (err) { 
            console.error("Save Error:", err); 
            if (window.erpDialog) window.erpDialog.alert("Failed to save changes: " + err.message); 
            else alert("Failed to save changes: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !user) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-[#fcfcfc] dark:bg-[#121212] w-full max-w-4xl h-[90vh] rounded-[2rem] flex flex-col overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl">
                
                {/* Header */}
                <div className="bg-themePanel/95 backdrop-blur-3xl px-8 py-6 relative shrink-0 border-b border-black/5 dark:border-white/10 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold text-themeText mb-1">Edit {user.role === 'student' ? 'Student' : 'Staff'} Record</h2>
                        <p className="text-[13px] font-medium text-themeTextSec">Master override for {user.name} ({user.id})</p>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 bg-black/5 dark:bg-black/40 hover:bg-black/10 dark:hover:bg-white/10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec transition-colors">
                        <i className="fa-solid fa-xmark text-base"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 pt-4 gap-6 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20">
                    <button type="button" onClick={() => setActiveTab('master')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'master' ? 'border-themeAccent text-themeText dark:text-white' : 'border-transparent text-themeTextSec hover:text-themeText'}`}>
                        Master Info
                    </button>
                    <button type="button" onClick={() => setActiveTab('kyc')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'kyc' ? 'border-emerald-500 text-themeText dark:text-white' : 'border-transparent text-themeTextSec hover:text-themeText'}`}>
                        KYC & Confidential
                    </button>
                    {user.role === 'faculty' && (
                        <button type="button" onClick={() => setActiveTab('faculty')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'faculty' ? 'border-amber-500 text-themeText dark:text-white' : 'border-transparent text-themeTextSec hover:text-themeText'}`}>
                            Website Display (Faculty)
                        </button>
                    )}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/5 dark:bg-black/40">
                    <form id="master-user-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
                        
                        {/* PROFILE PHOTO SECTION (Visible on Master and Faculty tab) */}
                        {(activeTab === 'master' || activeTab === 'faculty') && (
                            <div className="bg-white dark:bg-themePanel p-8 rounded-[1.5rem] border border-black/5 dark:border-white/10 flex flex-col md:flex-row gap-8 items-start shadow-sm">
                                <div className="flex-1 w-full">
                                    <h4 className="text-[15px] font-bold text-themeText mb-4"><i className="fa-solid fa-camera text-themeAccent mr-2"></i> Profile Image</h4>
                                    <div className="flex gap-3 mb-6">
                                        <div className="relative overflow-hidden group">
                                            <input type="file" accept="image/*" onChange={onSelectFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="bg-themeAccent text-themeText px-5 py-2.5 rounded-xl text-[14px] font-bold tracking-normal transition group-hover:bg-themeAccent/90 flex items-center gap-2 pointer-events-none">
                                                <i className="fa-solid fa-upload"></i> Select File
                                            </div>
                                        </div>
                                        <button type="button" onClick={loadCurrentPhotoForCrop} className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-themeText dark:text-white px-5 py-2.5 rounded-xl text-[14px] font-bold tracking-normal transition flex items-center gap-2">
                                            <i className="fa-solid fa-crop-simple"></i> Edit Current
                                        </button>
                                    </div>
                                    
                                    {imgSrc && (
                                        <div className="mt-2 border-2 border-dashed border-black/5 dark:border-white/10 rounded-2xl overflow-hidden flex justify-center bg-black/5 dark:bg-black/40 p-4 max-h-72">
                                            <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop>
                                                <img ref={imgRef} src={imgSrc} alt="Crop" onLoad={onImageLoad} style={{ maxHeight: '256px', borderRadius: '8px' }} />
                                            </ReactCrop>
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0 flex flex-col items-center gap-3 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/10">
                                    <p className="text-[13px] font-bold text-themeTextSec">Current Avatar</p>
                                    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-themeBorder">
                                        <img src={formData.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=random`} className="w-full h-full object-cover" alt="Current" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={activeTab === 'master' ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-themeText mb-4">Core Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-themePanel p-6 rounded-[1.5rem] border border-black/5 dark:border-white/10 shadow-sm">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Full Name</label>
                                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-themeAccent outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">ERP ID</label>
                                    <input required type="text" name="erp_id" value={formData.erp_id} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-themeAccent outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Official Email ID</label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-themeAccent outline-none transition" />
                                </div>
                                
                                {user.role === 'student' ? (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-themeTextSec ml-1">Academic Batch (Curriculum)</label>
                                            <input type="text" name="academic_batch" value={formData.academic_batch} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-themeAccent outline-none transition" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-themeTextSec ml-1">Section</label>
                                            <input type="text" name="section" value={formData.section} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-themeAccent outline-none transition" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Department</label>
                                        <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-themeAccent outline-none transition" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={activeTab === 'kyc' ? 'block' : 'hidden'}>
                            <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2"><i className="fa-solid fa-shield-halved"></i> Confidential & KYC</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-themePanel p-6 rounded-[1.5rem] border border-black/5 dark:border-white/10 shadow-sm">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Phone Number (10 Digits)</label>
                                    <input type="text" pattern="\d{10}" maxLength="10" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Aadhar Number (12 Digits)</label>
                                    <input type="text" pattern="\d{12}" maxLength="12" name="aadhar" value={formData.aadhar} onChange={handleInputChange} placeholder="123456789012" className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                
                                {/* Bank Details Section */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 mt-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Bank Name</label>
                                        <input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} placeholder="HDFC Bank" className="w-full bg-white dark:bg-themeApp border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Account Number</label>
                                        <input type="text" name="bank_account" value={formData.bank_account} onChange={handleInputChange} placeholder="501000..." className="w-full bg-white dark:bg-themeApp border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">IFSC Code</label>
                                        <input type="text" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleInputChange} placeholder="HDFC000123" className="w-full bg-white dark:bg-themeApp border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Blood Group</label>
                                    <input type="text" name="blood_group" value={formData.blood_group} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Present Address</label>
                                    <textarea rows="2" name="present_address" value={formData.present_address} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition resize-none" />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Permanent Address</label>
                                    <textarea rows="2" name="permanent_address" value={formData.permanent_address} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition resize-none" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Father's Name</label>
                                    <input type="text" name="father_name" value={formData.father_name} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Mother's Name</label>
                                    <input type="text" name="mother_name" value={formData.mother_name} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Past Legal Generations</label>
                                    <input type="text" name="past_legal_generations" value={formData.past_legal_generations} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-themeTextSec ml-1">Legal Interest</label>
                                    <input type="text" name="legal_interest" value={formData.legal_interest} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-emerald-500 outline-none transition" />
                                </div>
                            </div>
                        </div>

                        {user.role === 'faculty' && (
                            <div className={activeTab === 'faculty' ? 'block' : 'hidden'}>
                                <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center gap-2"><i className="fa-solid fa-globe"></i> Website Profile Display</h3>
                                <div className="grid grid-cols-1 gap-6 bg-white dark:bg-themePanel p-6 rounded-[1.5rem] border border-black/5 dark:border-white/10 shadow-sm">
                                    <div className="flex items-center gap-3 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                                        <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleInputChange} className="w-5 h-5 rounded accent-amber-500 cursor-pointer" id="is_public_toggle" />
                                        <label htmlFor="is_public_toggle" className="text-sm font-bold text-themeText dark:text-white cursor-pointer select-none">
                                            Publish to Public Website Directory
                                            <p className="text-[11px] text-themeTextSec mt-1">If unchecked, this profile is hidden from prudentiacollege.edu/faculty.</p>
                                        </label>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Designation</label>
                                        <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Founder & Professor" className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Specialisation</label>
                                        <input type="text" name="specialisation" value={formData.specialisation} onChange={handleInputChange} placeholder="Constitutional Law" className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Research Interests (Comma separated)</label>
                                        <input type="text" name="research" value={formData.research} onChange={handleInputChange} placeholder="Corporate Law, Human Rights" className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-themeText dark:text-white focus:border-amber-500 outline-none transition" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-themeTextSec ml-1">Biography</label>
                                        <textarea rows="4" name="bio" value={formData.bio} onChange={handleInputChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText dark:text-white focus:border-amber-500 outline-none transition resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-themePanel/95 backdrop-blur-3xl p-6 border-t border-black/5 dark:border-white/10 flex justify-end shrink-0 gap-4 z-10">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-8 py-3 rounded-xl font-bold tracking-normal text-[12px] text-themeTextSec hover:bg-black/5 dark:hover:bg-white/10 transition">
                        Cancel
                    </button>
                    <button form="master-user-form" type="submit" disabled={isSaving} className="bg-themeAccent hover:bg-themeAccent/90 text-themeText dark:text-white px-10 py-3 rounded-xl font-black tracking-normal text-[12px] transition hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                        {isSaving ? (
                            <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Saving Changes...</>
                        ) : (
                            <><i className="fa-solid fa-check"></i> Save Record</>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
