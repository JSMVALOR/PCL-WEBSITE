/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
 return centerCrop(
 makeAspectCrop(
 { unit: '%', width: 90 },
 aspect,
 mediaWidth,
 mediaHeight
 ),
 mediaWidth,
 mediaHeight
 );
}

export default function AdminFacultyEditorModal({ facultyId, onClose, onSave }) {
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState({});
 
 // Image cropping states
 const [imgSrc, setImgSrc] = useState('');
 const [crop, setCrop] = useState();
 const [completedCrop, setCompletedCrop] = useState(null);
 const imgRef = useRef(null);

 useEffect(() => {
 fetchFacultyData();
 }, [facultyId]);

 const fetchFacultyData = async () => {
 try {
 const { data, error } = await supabase
 .from('profiles')
 .select(`
 id, full_name, email, department,
 faculty_profiles (
 designation, specialisation, bio, degrees, office_address,
 phone, linkedin_url, scholar_url, image_url, is_public
 )
 `)
 .eq('id', facultyId)
 .single();

 if (error) throw error;
 
 setFormData({
 full_name: data.full_name || '',
 department: data.department || '',
 designation: data.faculty_profiles?.designation || '',
 specialisation: data.faculty_profiles?.specialisation || '',
 bio: data.faculty_profiles?.bio || '',
 degrees: data.faculty_profiles?.degrees || '',
 office_address: data.faculty_profiles?.office_address || '',
 phone: data.faculty_profiles?.phone || '',
 linkedin_url: data.faculty_profiles?.linkedin_url || '',
 scholar_url: data.faculty_profiles?.scholar_url || '',
 image_url: data.faculty_profiles?.image_url || ''
 });
 } catch (err) {
 console.error("Failed to load faculty:", err);
 window.erpDialog?.alert('Failed to load faculty data.');
 } finally {
 setLoading(false);
 }
 };

 const handleInputChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 };

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
 setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio
 };

 const getCroppedImg = async (image, crop) => {
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

 return new Promise((resolve) => {
 canvas.toBlob(blob => {
 if (!blob) {
 console.error('Canvas is empty');
 return resolve(null);
 }
 resolve(blob);
 }, 'image/jpeg', 0.9);
 });
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setSaving(true);
 
 try {
 let finalImageUrl = formData.image_url;

 // 1. Upload cropped image if exists
 if (completedCrop && completedCrop.width && completedCrop.height && imgRef.current) {
 const blob = await getCroppedImg(imgRef.current, completedCrop);
 if (blob) {
 const fileName = `faculty_${facultyId}_${Date.now()}.jpg`;
 const { data: uploadData, error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

 if (uploadError) throw uploadError;
 
 const { data: { publicUrl } } = supabase.storage
 .from('avatars')
 .getPublicUrl(fileName);
 
 finalImageUrl = publicUrl;
 }
 }

 // 2. Update profiles table
 const { error: profileError } = await supabase
 .from('profiles')
 .update({
 full_name: formData.full_name,
 department: formData.department
 })
 .eq('id', facultyId);

 if (profileError) throw profileError;

 // 3. Upsert faculty_profiles table (creates if missing)
 const { error: fProfileError } = await supabase
 .from('faculty_profiles')
 .upsert({
 id: facultyId,
 designation: formData.designation,
 specialisation: formData.specialisation,
 bio: formData.bio,
 degrees: formData.degrees,
 office_address: formData.office_address,
 phone: formData.phone,
 linkedin_url: formData.linkedin_url,
 scholar_url: formData.scholar_url,
 image_url: finalImageUrl
 });

 if (fProfileError) throw fProfileError;

 onSave();
 } catch (err) {
 console.error("Save error:", err);
 window.erpDialog?.alert(`Save failed: ${err.message}`);
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
 <div className="bg-themePanel/85 backdrop-blur-2xl p-8 rounded-3xl flex flex-col items-center">
 <div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin mb-4"></div>
 <p className="text-xs font-black uppercase tracking-widest text-themeTextSec">Loading Profile Data...</p>
 </div>
 </div>,
 document.body
 );
 }

 return createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
 <div className="bg-[#fcfcfc] w-full max-w-4xl rounded-[2rem] flex flex-col max-h-[90vh] overflow-hidden border border-black/10 dark:border-white/20">
 
 {/* HEADER */}
 <div className="bg-themePanel/85 backdrop-blur-2xl px-8 py-6 relative shrink-0 border-b border-neutral-100 flex justify-between items-center z-10">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-themeAccent/10 flex items-center justify-center">
 <i className="fa-solid fa-user-pen text-themeAccent text-xl"></i>
 </div>
 <div>
 <h3 className="text-xl font-black text-themeText tracking-tight">Edit Faculty Profile</h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-1">Manage public identity and details</p>
 </div>
 </div>
 <button type="button" onClick={onClose} className="w-10 h-10 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center text-themeTextSec  transition-colors active:scale-95">
 <i className="fa-solid fa-xmark text-base"></i>
 </button>
 </div>

 {/* SCROLLABLE CONTENT */}
 <div className="overflow-y-auto flex-1 bg-neutral-50/50 no-scrollbar p-8">
 <form id="faculty-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
 
 {/* PHOTO SECTION */}
 <div className="bg-themePanel/85 backdrop-blur-2xl p-8 rounded-[1.5rem] border border-neutral-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-themeAccent to-themeAccent/20"></div>
 
 <div className="flex-1 w-full flex flex-col">
 <h4 className="text-sm font-black text-themeText uppercase tracking-widest mb-4 flex items-center gap-2">
 <i className="fa-solid fa-camera text-themeAccent"></i> Profile Photo
 </h4>
 
 <div className="flex gap-3 mb-6">
 <div className="relative overflow-hidden group">
 <input type="file" accept="image/*" onChange={onSelectFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
 <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.erpDialog?.alert("Feature coming soon!"); }} type="button" className="bg-themeAccent text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition group-hover:bg-themeAccent/90 flex items-center gap-2">
 <i className="fa-solid fa-upload"></i> Upload New
 </button>
 </div>
 <button 
 type="button" 
 onClick={loadCurrentPhotoForCrop}
 className="bg-neutral-100 text-themeText border border-neutral-200 hover:border-neutral-300 hover:bg-themeBorder hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-2"
 >
 <i className="fa-solid fa-crop-simple"></i> Adjust Current
 </button>
 </div>
 
 {imgSrc && (
 <div className="mt-2 border-2 border-dashed border-neutral-200 rounded-2xl overflow-hidden flex justify-center bg-neutral-50 p-4 max-h-72">
 <ReactCrop
 crop={crop}
 onChange={(_, percentCrop) => setCrop(percentCrop)}
 onComplete={(c) => setCompletedCrop(c)}
 aspect={1}
 circularCrop
 >
 <img ref={imgRef} src={imgSrc} alt="Crop me" onLoad={onImageLoad} style={{ maxHeight: '256px', borderRadius: '8px' }} />
 </ReactCrop>
 </div>
 )}
 </div>
 
 <div className="shrink-0 flex flex-col items-center gap-3 bg-themeElevated/90 backdrop-blur-2xl p-6 rounded-2xl border border-black/5 dark:border-white/10">
 <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Display</p>
 <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-themeBorder hover:bg-white/10 border border-white/10">
 <img src={formData.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-full h-full object-cover" alt="Current" />
 </div>
 </div>
 </div>

 {/* DETAILS SECTION */}
 <div className="bg-themePanel/85 backdrop-blur-2xl p-8 rounded-[1.5rem] border border-neutral-100 flex flex-col gap-6 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 to-transparent"></div>
 
 <h4 className="text-sm font-black text-themeText uppercase tracking-widest mb-2 flex items-center gap-2">
 <i className="fa-solid fa-address-card text-neutral-400"></i> Identity & Contact
 </h4>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Bio / Introduction</label>
 <textarea 
 name="bio" 
 value={formData.bio} 
 onChange={handleInputChange} 
 rows={3}
 placeholder="A brief overview of the faculty member..."
 className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-medium focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition resize-y" 
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Full Name</label>
 <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Department</label>
 <input type="text" name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Designation</label>
 <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Specialisation</label>
 <input type="text" name="specialisation" value={formData.specialisation} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Degrees</label>
 <input type="text" name="degrees" value={formData.degrees} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Office Address</label>
 <input type="text" name="office_address" value={formData.office_address} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Phone Number</label>
 <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">LinkedIn URL</label>
 <input type="text" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1 text-themeTextSec">Google Scholar URL</label>
 <input type="text" name="scholar_url" value={formData.scholar_url} onChange={handleInputChange} className="w-full bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-xl p-4 text-sm font-bold focus:border-themeAccent focus:ring-2 focus:ring-themeAccent/20 focus:bg-themePanel/85 backdrop-blur-2xl outline-none text-themeText transition" />
 </div>
 <div className="md:col-span-2 flex items-center gap-3 bg-themePanel/85 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-4 rounded-xl mt-2">
    <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleInputChange} className="w-5 h-5 rounded accent-themeAccent cursor-pointer" id="is_public_toggle" />
    <label htmlFor="is_public_toggle" className="text-sm font-bold text-themeText cursor-pointer select-none">
        Publish to Website Directory
        <p className="text-[10px] text-themeTextSec font-medium mt-0.5 normal-case">If disabled, this faculty member will be hidden from the public website.</p>
    </label>
 </div>

 </div>
 </div>
 </form>
 </div>

 {/* FOOTER */}
 <div className="bg-themePanel/85 backdrop-blur-2xl p-6 border-t border-neutral-100 flex justify-end shrink-0 gap-4 z-10">
 <button type="button" onClick={onClose} disabled={saving} className="px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-themeTextSec bg-neutral-100 hover:bg-themeBorder hover:bg-white/10 border border-white/10 hover:text-themeText transition">
 Cancel
 </button>
 <button form="faculty-edit-form" type="submit" disabled={saving} className="bg-themeAccent hover:bg-themeAccent/90 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
 {saving ? (
 <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Saving Changes...</>
 ) : (
 <><i className="fa-solid fa-save text-sm"></i> Save Profile</>
 )}
 </button>
 </div>
 </div>
 </div>,
 document.body
 );
}
