/* © 2026 JSM VALOR. All Rights Reserved. */
import SlideCommit from '../../../../Shared/components/ReactBits/SlideCommit/SlideCommit';
import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper to generate cropped image blob
function getCroppedImg(image, crop, fileName) {
 const canvas = document.createElement('canvas');
 const scaleX = image.naturalWidth / image.width;
 const scaleY = image.naturalHeight / image.height;
 canvas.width = crop.width;
 canvas.height = crop.height;
 const ctx = canvas.getContext('2d');

 ctx.drawImage(
 image,
 crop.x * scaleX,
 crop.y * scaleY,
 crop.width * scaleX,
 crop.height * scaleY,
 0,
 0,
 crop.width,
 crop.height
 );

 return new Promise((resolve, reject) => {
 canvas.toBlob(
 (blob) => {
 if (!blob) {
 reject(new Error('Canvas is empty'));
 return;
 }
 blob.name = fileName;
 resolve(blob);
 },
 'image/jpeg',
 0.9
 );
 });
}

export default function ProfileEditModal({ profileData, userRole = 'student', onClose, onSubmit, hasPendingRequest }) {
 const [isSubmitting, setIsSubmitting] = useState(false);
 
 // Form State
 const [formData, setFormData] = useState({
 phone: profileData.phone || '',
 blood_group: profileData.blood_group || '',
 dob: profileData.dob || '',
 currentAddress: profileData.questionnaire_data?.currentAddress || '',
 emergencyName: profileData.questionnaire_data?.emergencyName || '',
 emergencyRelation: profileData.questionnaire_data?.emergencyRelation || '',
 emergencyPhone: profileData.questionnaire_data?.emergencyPhone || '',
 profile_picture_url: profileData.profile_picture_url || '',
        parent_name: profileData.parent_name || '',
        parent_phone: profileData.parent_phone || '',
        parent_email: profileData.parent_email || ''
 });

 // Cropping State
 const [upImg, setUpImg] = useState();
 const imgRef = useRef(null);
 const [crop, setCrop] = useState({ unit: '%', width: 50, height: 50, x: 25, y: 25, aspect: 1 });
 const [completedCrop, setCompletedCrop] = useState(null);
 const [isCropping, setIsCropping] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);
 const fileInputRef = useRef(null);

 const onSelectFile = (e) => {
 if (e.target.files && e.target.files.length > 0) {
 const file = e.target.files[0];
 // Enforce 2MB size limit to prevent server lag
 if (file.size > 2 * 1024 * 1024) {
 window.erpDialog?.alert('Please select an image smaller than 2MB.');
 return;
 }
 const reader = new FileReader();
 reader.addEventListener('load', () => {
 setUpImg(reader.result);
 setIsCropping(true);
 });
 reader.readAsDataURL(file);
 }
 };

 const onLoad = useCallback((img) => {
 imgRef.current = img;
 }, []);

 const uploadCroppedImage = async () => {
 if (!completedCrop || !imgRef.current) return;
 
 try {
 setUploadingImage(true);
 setIsCropping(false);
 
 const croppedBlob = await getCroppedImg(
 imgRef.current,
 completedCrop,
 'cropped-avatar.jpeg'
 );

 const fileName = `${profileData.id}-${Date.now()}.jpeg`;
 const filePath = `pending_avatars/${fileName}`;

 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, croppedBlob, {
 contentType: 'image/jpeg'
 });

 if (uploadError) throw uploadError;

 const { data: urlData } = supabase.storage
 .from('avatars')
 .getPublicUrl(filePath);

 setFormData({ ...formData, profile_picture_url: urlData.publicUrl });
 } catch (error) {
 console.error('Error uploading cropped image:', error);
 window.erpDialog?.alert('Failed to upload image.');
 } finally {
 setUploadingImage(false);
 setUpImg(null);
 }
 };

 const handleSubmit = async (e) => {
 if(e) e.preventDefault();
 if (hasPendingRequest) {
 window.erpDialog?.alert('You already have a pending profile update request.');
 return;
 }

 setIsSubmitting(true);
 try {
 const requestedChanges = {
 phone: formData.phone || null,
 blood_group: formData.blood_group || null,
 dob: formData.dob || null,
 profile_picture_url: formData.profile_picture_url || null,
            parent_name: formData.parent_name || null,
            parent_phone: formData.parent_phone || null,
            parent_email: formData.parent_email || null,
 questionnaire_data: {
 ...profileData.questionnaire_data,
 currentAddress: formData.currentAddress || null,
 emergencyName: formData.emergencyName || null,
 emergencyRelation: formData.emergencyRelation || null,
 emergencyPhone: formData.emergencyPhone || null
 }
 };

 if (userRole === 'admin' || userRole === 'faculty') {
 const { data, error } = await supabase
 .from('profiles')
 .update({
 phone: requestedChanges.phone,
 blood_group: requestedChanges.blood_group,
 dob: requestedChanges.dob,
 profile_picture_url: requestedChanges.profile_picture_url,
 questionnaire_data: requestedChanges.questionnaire_data
 })
 .eq('id', profileData.id)
 .select()
 .single();

 if (error) throw error;
 window.erpDialog?.alert('Profile updated successfully.');
 onSubmit(data, true);
 } else {
 const { data, error } = await supabase
 .from('profile_update_requests')
 .insert({
 student_id: profileData.id,
 requested_changes: requestedChanges,
 status: 'pending'
 })
 .select()
 .single();

 if (error) throw error;
 window.erpDialog?.alert('Profile update request submitted for admin approval.');
 onSubmit(data, false);
 }
 } catch (error) {
 console.error('Error submitting request:', error);
 window.erpDialog?.alert(`Failed to save changes: ${error.message || error}`);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <AnimatePresence>
 <motion.div 
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 1.02 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 className="fixed inset-0 bg-transparent z-[9999] flex flex-col overflow-y-auto custom-scrollbar"
 >
 {/* Premium Full-Screen Header */}
 <div className="sticky top-0 z-50 bg-transparent/80 backdrop-blur-xl border-b border-black/10 dark:border-white/20 px-6 lg:px-12 py-5 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-white/80 dark:bg-themeElevated/80 backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-sm text-themeText dark:text-themeText hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
 <i className="fa-solid fa-arrow-left"></i>
 </button>
 <div>
 <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-themeText tracking-tight">Edit Profile</h2>
 {userRole === 'student' && (
 <p className="text-[10px] font-bold text-amber-500 tracking-normal mt-0.5"><i className="fa-solid fa-shield-halved mr-1"></i> Requires Admin Approval</p>
 )}
 </div>
 </div>
 
 {!hasPendingRequest && !isCropping && (
 <button type="button" 
 onClick={handleSubmit} 
 disabled={isSubmitting || uploadingImage} 
 className="px-6 py-2.5 rounded-full text-[14px] font-medium tracking-normal bg-themeAccent text-themeApp hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 hover:scale-105 active:scale-95"
 >
 {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</> : <><i className="fa-solid fa-check"></i> Save Changes</>}
 </button>
 )}
 </div>

 {/* Main Content Area */}
 <div className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-12 py-10 flex flex-col gap-10">
 
 {hasPendingRequest ? (
 <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border-amber-500/30 ring-1 ring-amber-500/30 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
 <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
 <i className="fa-solid fa-hourglass-half text-3xl text-amber-500"></i>
 </div>
 <h3 className="text-xl font-semibold tracking-tight text-themeText mb-2">Pending Request</h3>
 <p className="text-sm font-medium text-themeTextSec max-w-md">Your profile update is currently under review by the administration. You will be notified once it is approved.</p>
 </div>
 ) : (
 <>
 {/* Avatar Section */}
 <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] rounded-3xl p-8 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-full max-w-[16rem] md:w-64 h-64 bg-themeAccent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
 <h3 className="text-[14px] font-medium tracking-normal text-themeTextSec w-full text-left absolute top-6 left-8">Profile Picture</h3>
 
 <div className="relative group cursor-pointer mt-4" onClick={() => fileInputRef.current?.click()}>
 <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-themePanel border-theme border-themeBorderStrong border-4 border-themePanel ring-2 ring-themeBorder flex items-center justify-center overflow-hidden transition group-hover:ring-themeAccent">
 {formData.profile_picture_url ? (
 <img src={formData.profile_picture_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
 ) : (
 <i className="fa-solid fa-camera text-4xl text-themeTextSec"></i>
 )}
 <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
 {uploadingImage ? (
 <i className="fa-solid fa-circle-notch fa-spin text-themeText dark:text-white text-2xl"></i>
 ) : (
 <>
 <i className="fa-solid fa-upload text-themeText dark:text-white mb-2 text-xl"></i>
 <span className="text-[9px] font-black text-themeText dark:text-white tracking-normal">Update Photo</span>
 </>
 )}
 </div>
 </div>
 <input 
 type="file" 
 accept="image/png, image/jpeg, image/webp" 
 className="hidden" 
 ref={fileInputRef} 
 onChange={onSelectFile} 
 disabled={uploadingImage || isCropping} 
 />
 </div>
 <p className="text-[11px] font-bold text-themeTextSec text-center">JPEG, PNG or WebP under 2MB.</p>
 </div>

 {/* Personal Details */}
 <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] rounded-3xl p-8">
 <h3 className="text-[14px] font-medium tracking-normal text-themeText mb-6 flex items-center gap-2">
 <i className="fa-solid fa-id-card text-themeAccent"></i> Personal Details
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Phone Number</label>
 <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="+91 9876543210" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Blood Group</label>
 <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition appearance-none font-medium">
 <option value="">Select...</option>
 <option>A+</option><option>A-</option>
 <option>B+</option><option>B-</option>
 <option>AB+</option><option>AB-</option>
 <option>O+</option><option>O-</option>
 </select>
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Date of Birth</label>
 <input min="2026-09-14" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" />
 </div>
 <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Current Address</label>
 <input type="text" value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="Full residential address" />
 </div>
 </div>
 </div>

 
                        {/* Parent / Guardian Details */}
                        <div className="bg-themePanel/50 rounded-3xl p-6 lg:p-8 border border-black/5 dark:border-white/5 space-y-6 mb-6">
                            <h3 className="text-[15px] font-semibold text-themeText tracking-normal flex items-center gap-3">
                                <i className="fa-solid fa-users text-themeAccent"></i> Parent / Guardian Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-themeTextSec tracking-normal">Parent Name</label>
                                    <input type="text" name="parent_name" value={formData.parent_name || ''} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-themeTextSec tracking-normal">Parent Phone</label>
                                    <input type="text" name="parent_phone" value={formData.parent_phone || ''} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-themeTextSec tracking-normal">Parent Email (For Portal Login)</label>
                                    <input type="email" name="parent_email" value={formData.parent_email || ''} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-themeText outline-none focus:border-themeAccent focus:ring-1 focus:ring-themeAccent transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
 <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl saturate-[1.8] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] rounded-3xl p-8">
 <h3 className="text-[14px] font-medium tracking-normal text-themeText mb-6 flex items-center gap-2">
 <i className="fa-solid fa-heart-pulse text-rose-500"></i> Emergency Contact
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2 md:col-span-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Contact Name</label>
 <input type="text" value={formData.emergencyName} onChange={e => setFormData({...formData, emergencyName: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="Full Name" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Relationship</label>
 <input type="text" value={formData.emergencyRelation} onChange={e => setFormData({...formData, emergencyRelation: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="e.g. Father, Mother" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec ml-1">Emergency Phone</label>
 <input type="tel" value={formData.emergencyPhone} onChange={e => setFormData({...formData, emergencyPhone: e.target.value})} className="bg-themePanel border-theme border-themeBorderStrong rounded-xl px-5 py-3.5 text-sm text-themeText outline-none focus:border-themeAccent focus:ring-4 focus:ring-themeAccent/10 transition font-medium" placeholder="+91 9876543210" />
 </div>
 </div>
 </div>
 </>
 )}
 </div>

 {/* Cropping Modal Overlay */}
 {isCropping && upImg && (
 <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
 <div className="bg-themePanel border-theme border-themeBorderStrong p-6 rounded-3xl w-full max-w-2xl flex flex-col items-center border border-black/10 dark:border-white/20">
 <h3 className="text-lg font-semibold tracking-tight text-themeText mb-6">Crop Profile Picture</h3>
 
 <div className="w-full max-h-[50vh] overflow-auto flex justify-center bg-gray-50 dark:bg-black/20 rounded-xl mb-6">
 <ReactCrop
 crop={crop}
 onChange={(c) => setCrop(c)}
 onComplete={(c) => setCompletedCrop(c)}
 aspect={1}
 circularCrop
 className="max-h-[50vh]"
 >
 <img src={upImg} onLoad={(e) => onLoad(e.currentTarget)} alt="Upload Preview" className="max-h-[50vh] object-contain" />
 </ReactCrop>
 </div>
 
 <div className="flex gap-4 w-full justify-end">
 <button type="button" 
 onClick={() => { setIsCropping(false); setUpImg(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} 
 className="px-6 py-2.5 rounded-full text-[14px] font-medium tracking-normal text-themeTextSec hover:bg-themePanel border-theme border-themeBorderStrong transition-colors"
 >
 Cancel
 </button>
 <SlideCommit
                label="Slide to Confirm"
                doneLabel="Done"
                errorLabel="Failed"
                onConfirm={uploadCroppedImage}
                trackColor="rgba(28, 28, 30, 0.05)"
                handleColor="#007AFF"
                successColor="#10b981"
                dangerColor="#f43f5e"
                width={200}
                height={48}
                radius={12}
            />
 </div>
 </div>
 </div>
 )}
 </motion.div>
 </AnimatePresence>
 );
}
