/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../../lib/EmailService';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function UserProvisioningHub({ onClose, provisionClient, onProvisioned }) {
 const [activeTab, setActiveTab] = useState('create');
 
 // Left Side: Provisioning Form
 const [newUserRole, setNewUserRole] = useState("student");
 const [newUserName, setNewUserName] = useState("");
 const [newUserEmail, setNewUserEmail] = useState("");
 const [assignment, setAssignment] = useState("");
 const [batches, setBatches] = useState([]);
 const [isProvisioning, setIsProvisioning] = useState(false);
 const [provisionLogs, setProvisionLogs] = useState([]);
 
 // Right Side: Extended Edit Info (Only available when a user is loaded)
 const [provisionedUser, setProvisionedUser] = useState(null);
 const [extField1, setExtField1] = useState("");
 const [extField2, setExtField2] = useState("");
 const [extField3, setExtField3] = useState("");
 
 // Image Cropping
 const [imgSrc, setImgSrc] = useState('');
 const imgRef = useRef(null);
 const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
 const [completedCrop, setCompletedCrop] = useState(null);
 const [isSavingExtended, setIsSavingExtended] = useState(false);

 // Stats
 const [stats, setStats] = useState({ mailSent: 0, credentialsSent: 0, provisionedCount: 0 });

 useEffect(() => {
 // Fetch actual cohorts
 const fetchBatches = async () => {
 const { data } = await supabase.from('academic_batches').select('id, name, start_year').order('start_year', { ascending: false });
 if (data) setBatches(data);
 };
 fetchBatches();
 }, []);

 const [provisionMode, setProvisionMode] = useState("single");
 const [bulkRows, setBulkRows] = useState([{ name: '', batch: '', email: '' }]);

 const handleBulkPaste = (e, rowIndex, startCol) => {
 const pasteData = e.clipboardData.getData('text');
 if (pasteData.includes('\t') || pasteData.includes('\n')) {
 e.preventDefault();
 const lines = pasteData.split(/\r?\n/).filter(l => l.trim() !== '');
 const newRows = [...bulkRows];
 
 lines.forEach((line, i) => {
 const targetRow = rowIndex + i;
 if (!newRows[targetRow]) {
 newRows[targetRow] = { name: '', batch: '', email: '' };
 }
 
 let parts = line.split('\t');
 if (parts.length < 2 && line.includes(',')) parts = line.split(',');

 const cols = ['name', 'batch', 'email'];
 parts.forEach((part, colOffset) => {
 const targetCol = startCol + colOffset;
 if (targetCol < cols.length && part) {
 newRows[targetRow][cols[targetCol]] = part.trim();
 }
 });
 });
 
 if (newRows[newRows.length - 1].name || newRows[newRows.length - 1].email) {
 newRows.push({ name: '', batch: '', email: '' });
 }
 setBulkRows(newRows);
 }
 };

 const updateBulkRow = (index, field, value) => {
 const newRows = [...bulkRows];
 newRows[index][field] = value;
 if (index === newRows.length - 1 && value) {
 newRows.push({ name: '', batch: '', email: '' });
 }
 setBulkRows(newRows);
 };

 const removeBulkRow = (index) => {
 const newRows = bulkRows.filter((_, i) => i !== index);
 if (newRows.length === 0) newRows.push({ name: '', batch: '', email: '' });
 setBulkRows(newRows);
 };

 const provisionUser = async (name, email, role, assign, currentNextNum) => {
 let shortcut = "BBL";
 if (assign.includes("BA LLB")) shortcut = "BAL";
 if (assign.includes("LLB") && !assign.includes("BA ")) shortcut = "LLB";
 
 let yearPrefix = new Date().getFullYear().toString().substring(2);
 const yearMatch = assign.match(/\((\d{4})/);
 if (yearMatch && yearMatch[1]) {
 yearPrefix = yearMatch[1].substring(2);
 }

 const prefix = role === "student" ? `${yearPrefix}${shortcut}` : "FAC";
 
 let nextNum = currentNextNum;
 if (!nextNum) {
 const { data: highestIdData } = await supabase.from('profiles').select('erp_id').ilike('erp_id', `${prefix}%`).order('erp_id', { ascending: false }).limit(1);
 nextNum = 1;
 if (highestIdData && highestIdData.length > 0 && highestIdData[0].erp_id) {
 const lastId = highestIdData[0].erp_id;
 const numMatch = lastId.match(/\d+$/);
 const parsedNum = numMatch ? parseInt(numMatch[0], 10) : 0;
 if (!isNaN(parsedNum) && parsedNum > 0) nextNum = parsedNum + 1;
 }
 }
 
 const generatedId = `${prefix}${nextNum.toString().padStart(4, '0')}`;
 const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
 let generatedPassword = "PCL";
 const alphaNumChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
 for (let i = 0; i < 6; i++) {
 generatedPassword += alphaNumChars.charAt(Math.floor(Math.random() * alphaNumChars.length));
 }

 const { data: rpcUserId, error: authError } = await supabase.rpc('admin_create_user', {
 new_email: email,
 new_password: generatedPassword,
 new_role: role,
 new_erp_id: generatedId,
 new_name: name,
 new_assignment: assign
 });

 if (authError) throw authError;

 const profilePayload = {
 id: rpcUserId,
 role: role,
 erp_id: generatedId,
 email: email,
 full_name: name,
 status: 'Active',
 ...(role === 'student' ? { academic_batch: assign } : { department: assign })
 };

 let emailSent = false;
 try {
 await sendSystemEmail('ERP_NEW_ACCOUNT', {
 to_email: email,
 name: name,
 erp_id: generatedId,
 password: generatedPassword
 });
 emailSent = true;
 } catch (err) {
 console.error("Email send failed for", email, err);
 }

 return { profilePayload, emailSent, generatedId, nextNum: nextNum + 1 };
 };

 const handleProvisionSubmit = async (e) => {
 e.preventDefault();
 if (provisionMode === 'single') {
 if (!newUserName || !newUserEmail || !assignment) return;
 setIsProvisioning(true);
 setProvisionLogs([]);
 try {
 setProvisionLogs(prev => [...prev, `[INIT] Provisioning for ${newUserName}...`]);
 const result = await provisionUser(newUserName, newUserEmail, newUserRole, assignment, null);
 
 setProvisionLogs(prev => [...prev, `[SUCCESS] Profile created in DB (${result.generatedId}). Passcode: ${result.password}`]);
 if (result.emailSent) {
 setProvisionLogs(prev => [...prev, `[EMAIL] Credentials notice sent.`]);
 setStats(s => ({ ...s, mailSent: s.mailSent + 1, credentialsSent: s.credentialsSent + 1 }));
 } else {
 setProvisionLogs(prev => [...prev, `[WARNING] Failed to send email.`]);
 }
 setStats(s => ({ ...s, provisionedCount: s.provisionedCount + 1 }));
 setProvisionedUser(result.profilePayload);
 setProvisionLogs(prev => [...prev, `[COMPLETE] Ready for extended config.`]);
 if (onProvisioned) onProvisioned();
 } catch (error) {
 setProvisionLogs(prev => [...prev, `[ERROR] ${error.message}`]);
 } finally {
 setIsProvisioning(false);
 }
 } else {
 // Bulk Provisioning
 const validRows = bulkRows.filter(row => row.name && row.email);
 if (validRows.length === 0) return;
 setIsProvisioning(true);
 setProvisionLogs([]);
 setProvisionLogs(prev => [...prev, `[INIT] Starting bulk provision for ${validRows.length} users...`]);
 
 let currentNextNum = null;
 let successCount = 0;
 let emailCount = 0;

 for (let i = 0; i < validRows.length; i++) {
 const { name, email, batch } = validRows[i];
 // Fallback to globally selected assignment if batch column is missing
 const assignTarget = batch || assignment || "Unknown Batch";
 
 try {
 const result = await provisionUser(name, email, newUserRole, assignTarget, currentNextNum);
 currentNextNum = result.nextNum;
 successCount++;
 if (result.emailSent) emailCount++;
 setProvisionLogs(prev => [...prev, `[SUCCESS] ${name} (${result.generatedId}) provisioned. Passcode: ${result.password}`]);
 } catch (error) {
 setProvisionLogs(prev => [...prev, `[ERROR] Failed for ${name}: ${error.message}`]);
 }
 }
 
 setStats(s => ({ 
 ...s, 
 provisionedCount: s.provisionedCount + successCount,
 mailSent: s.mailSent + emailCount,
 credentialsSent: s.credentialsSent + emailCount
 }));
 setProvisionLogs(prev => [...prev, `[COMPLETE] Bulk provisioning finished. Added ${successCount}.`]);
 if (onProvisioned) onProvisioned();
 setIsProvisioning(false);
 setExtField1("");
 setExtField2("");
 setExtField3("");
 }
 };

 function onSelectFile(e) {
 if (e.target.files && e.target.files.length > 0) {
 setCrop({ unit: '%', width: 50, aspect: 1 });
 const reader = new FileReader();
 reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
 reader.readAsDataURL(e.target.files[0]);
 }
 }

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

 const handleSaveExtendedInfo = async () => {
 if (!provisionedUser) return;
 setIsSavingExtended(true);
 try {
 let photoUrl = provisionedUser.profile_picture_url;
 
 // Upload of cropped image
 if (completedCrop && completedCrop.width && completedCrop.height && imgRef.current) {
 const blob = await getCroppedImg(imgRef.current, completedCrop);
 if (blob) {
 const fileName = `user_${provisionedUser.id}_${Date.now()}.jpg`;
 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

 if (uploadError) {
 console.error("Image upload failed:", uploadError);
 window.erpDialog?.alert("Warning: Could not upload the image. The text changes will still be saved.");
 } else {
 const { data: { publicUrl } } = supabase.storage
 .from('avatars')
 .getPublicUrl(fileName);
 photoUrl = publicUrl;
 }
 }
 }

 let payload = { profile_picture_url: photoUrl };
 if (provisionedUser.role === 'student') {
 payload.parent_email = extField1 || null;
 payload.parent_name = extField2 || null;
 payload.parent_phone = extField3 || null;
 } else {
 payload.phone = extField1 || null;
 payload.department = extField2 || null;
 payload.faculty_type = extField3 || null;
 }

 const { error } = await supabase.from('profiles').update(payload).eq('id', provisionedUser.id);
 if (error) throw error;
 
 if(window.erpToast) window.erpToast.show("Extended Profile Updated Successfully.", "success");
 } catch (e) {
 console.error(e);
 if(window.erpToast) window.erpToast.show("Failed to save extended info.", "error");
 } finally {
 setIsSavingExtended(false);
 }
 };

 return (
 <div className="flex-1 w-full flex flex-col min-h-0 bg-themeApp animate-fade-in font-sans">
 <div className="flex min-h-[4rem] py-3 items-center justify-between px-4 md:px-6 border-b border-themeBorder bg-themePanel/80 dark:bg-themePanel/80 backdrop-blur-3xl saturate-[1.8] flex-wrap gap-4">
 <div className="flex items-center gap-4">
 <div>
 <h2 className="text-sm font-bold text-themeText tracking-tight">Rapid Provisioning Hub</h2>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Master Account Controller</p>
 </div>
 </div>
 
 {/* Stats */}
 <div className="flex items-center gap-6">
 <div className="flex flex-col items-end" title="Total accounts provisioned in this session">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest hidden sm:block">Accounts Created</span><span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest sm:hidden">Created</span>
 <span className="text-sm font-black text-themeText">{stats.provisionedCount}</span>
 </div>
 <div className="flex flex-col items-end" title="Total credential emails successfully sent">
 <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest hidden sm:block">Emails Sent</span><span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest sm:hidden">Sent</span>
 <span className="text-sm font-black text-emerald-500">{stats.mailSent}</span>
 </div>
 {onClose && (
     <div className="pl-4 md:pl-6 ml-auto md:ml-2 border-l border-themeBorder flex items-center">
         <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition flex items-center justify-center">
             <i className="fa-solid fa-xmark"></i>
         </button>
     </div>
 )}
 </div>
 </div>

 <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
 {/* LEFT SIDE: CREATION */}
<div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-themeBorder bg-themePanel/40 shrink-0 md:overflow-y-auto custom-scrollbar pb-10 md:pb-0">
 <div className="p-8 max-w-xl w-full mx-auto">
 <div className="mb-6">
 <div className="w-12 h-12 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-xl mb-4 border border-themeAccent/20">
 <i className="fa-solid fa-user-plus"></i>
 </div>
 <h3 className="text-2xl font-black text-themeText tracking-tight">Create & Provision</h3>
 <p className="text-xs font-bold text-themeTextSec mt-1 leading-relaxed">Generate new identities and instantly dispatch securely credentialed emails to the institution directory.</p>
 </div>
 
 <div className="flex p-1 bg-themeApp rounded-xl border border-themeBorder dark:border-white/[0.08] w-full shadow-inner mb-6">
 <button type="button" onClick={() => setProvisionMode('single')} className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition ${provisionMode === 'single' ? 'bg-themePanel shadow-sm text-themeText border border-themeBorder dark:border-white/[0.08]' : 'text-themeTextSec hover:text-themeText'}`}><i className="fa-solid fa-user mr-2"></i>Single Entry</button>
 <button type="button" onClick={() => setProvisionMode('bulk')} className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition ${provisionMode === 'bulk' ? 'bg-themePanel shadow-sm text-themeText border border-themeBorder dark:border-white/[0.08]' : 'text-themeTextSec hover:text-themeText'}`}><i className="fa-solid fa-users mr-2"></i>Bulk Import</button>
 </div>

 <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-5">
 <div className="flex p-1.5 bg-themeApp rounded-xl border border-themeBorder w-full shadow-inner">
 <button type="button" onClick={() => setNewUserRole("student")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${newUserRole === 'student' ? 'bg-themePanel shadow-sm text-themeAccent border border-themeBorder ' : 'text-themeTextSec hover:text-themeText'}`}>Student</button>
 <button type="button" onClick={() => setNewUserRole("faculty")} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${newUserRole === 'faculty' ? 'bg-themePanel shadow-sm text-themeAccent border border-themeBorder ' : 'text-themeTextSec hover:text-themeText'}`}>Faculty / Staff</button>
 </div>

 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Assign {newUserRole === 'student' ? 'Cohort / Batch' : 'Department'}</label>
 <select
 value={assignment}
 onChange={(e) => setAssignment(e.target.value)}
 className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition appearance-none shadow-sm"
 required
 >
 <option value="">Select Assignment...</option>
 {newUserRole === 'student' ? (
 batches.map(b => (
 <option key={b.id} value={b.name}>{b.name}</option>
 ))
 ) : (
 <>
 <option value="Law Faculty">Law Faculty</option>
 <option value="Administration">Administration</option>
 <option value="IT Services">IT Services</option>
 </>
 )}
 </select>
 </div>

 {provisionMode === 'single' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Full Name</label>
 <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="e.g. John Doe" required={provisionMode === 'single'} />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Institution Email</label>
 <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="e.g. john@pcl.edu" required={provisionMode === 'single'} />
 </div>
 </div>
 ) : (
 <div className="flex flex-col gap-3">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Bulk Data Editor (Paste from Excel/Sheets)</label>
 <div className="flex flex-col gap-2">
 <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-widest text-themeTextSec px-2">
 <div className="col-span-4">Full Name</div>
 <div className="col-span-3">Batch/Dept</div>
 <div className="col-span-4">Email</div>
 <div className="col-span-1"></div>
 </div>
 {bulkRows.map((row, idx) => (
 <div key={idx} className="grid grid-cols-12 gap-2 items-center">
 <input type="text" value={row.name} onChange={(e) => updateBulkRow(idx, 'name', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 0)} placeholder="Name" className="col-span-4 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
 <input type="text" value={row.batch} onChange={(e) => updateBulkRow(idx, 'batch', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 1)} placeholder="Default" className="col-span-3 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" title="Leave blank to use the dropdown assignment" />
 <input type="email" value={row.email} onChange={(e) => updateBulkRow(idx, 'email', e.target.value)} onPaste={(e) => handleBulkPaste(e, idx, 2)} placeholder="Email" className="col-span-4 bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-lg py-2 px-3 text-xs font-bold text-themeText outline-none transition shadow-sm" />
 <button type="button" onClick={() => removeBulkRow(idx)} className="col-span-1 text-themeTextSec hover:text-rose-500 transition text-sm flex justify-center"><i className="fa-solid fa-xmark"></i></button>
 </div>
 ))}
 </div>
 </div>
 )}

 <button type="submit" disabled={isProvisioning || (provisionMode === 'single' ? !newUserName : !bulkRows.some(r => r.name && r.email))} className="w-full mt-2 py-4 rounded-xl bg-themeText hover:scale-[1.02] text-themeApp text-[13px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
 {isProvisioning ? <><i className="fa-solid fa-spinner fa-spin"></i> Provisioning...</> : <><i className="fa-solid fa-bolt"></i> {provisionMode === 'single' ? 'Provision Identity' : `Bulk Provision (${bulkRows.filter(r => r.name && r.email).length})`} & Send Notice</>}
 </button>
 </form>

 {provisionLogs.length > 0 && (
 <div className="mt-8">
 <div className="flex justify-between items-end mb-3">
 <span className="text-[10px] font-black text-themeTextSec uppercase tracking-widest block">Live Execution Stream</span>
 <button onClick={() => navigator.clipboard.writeText(provisionLogs.join('\n'))} className="text-[10px] font-bold text-themeTextSec hover:text-themeText transition flex items-center gap-1"><i className="fa-regular fa-copy"></i> Copy Logs</button>
 </div>
 <div className="bg-black text-emerald-400 p-4 rounded-xl font-mono text-[10px] h-32 overflow-y-auto border border-themeBorder shadow-inner">
 {provisionLogs.map((log, i) => (
 <div key={i} className={log.includes('ERROR') ? 'text-rose-400' : ''}>&gt; {log}</div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* RIGHT SIDE: EDITING */}
<div className="w-full md:w-1/2 flex flex-col bg-themeApp shrink-0 md:overflow-y-auto custom-scrollbar min-h-[500px] md:min-h-0">
 {provisionedUser ? (
 <div className="p-8 max-w-xl w-full mx-auto animate-fade-in-up">
 <div className="mb-8 pb-8 border-b border-themeBorder flex items-start gap-5">
 <div className="w-16 h-16 rounded-2xl bg-themePanel shadow-sm border border-themeBorder flex items-center justify-center text-2xl font-bold text-themeAccent shrink-0">
 {provisionedUser.full_name.charAt(0)}
 </div>
 <div>
 <h3 className="text-xl font-black text-themeText tracking-tight">{provisionedUser.full_name}</h3>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">{provisionedUser.erp_id} &bull; {provisionedUser.role}</p>
 </div>
 </div>

 <div className="flex flex-col gap-8">
 {/* Photo Adjuster */}
 <div>
 <h4 className="text-xs font-black text-themeText uppercase tracking-widest mb-4">Portrait Adjustment</h4>
 <div className="bg-themePanel border border-themeBorder dark:border-white/[0.08] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
 <input type="file" accept="image/*" onChange={onSelectFile} className="text-xs font-bold text-themeTextSec file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-themeAccent/10 file:text-themeAccent hover:file:bg-themeAccent/20 transition cursor-pointer" />
 
 {imgSrc && (
 <div className="mt-2 border border-dashed border-themeBorder p-2 rounded-xl flex justify-center bg-themeElevated">
 <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1}>
 <img ref={imgRef} alt="Crop me" src={imgSrc} className="max-h-64 object-contain rounded-lg" />
 </ReactCrop>
 </div>
 )}
 {imgSrc && <p className="text-[10px] font-bold text-themeTextSec text-center">Crop tool is active. Adjust to square aspect ratio.</p>}
 </div>
 </div>

 {/* Basic Info */}
 <div>
 <h4 className="text-xs font-black text-themeText uppercase tracking-widest mb-4">Extended Records</h4>
 {provisionedUser?.role === 'student' ? (
 <div className="grid grid-cols-1 gap-5">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Parent Mail ID</label>
 <input type="email" value={extField1} onChange={(e) => setExtField1(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="Parent/Guardian Email" />
 </div>
 <div className="grid grid-cols-2 gap-5">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Parent/Guardian Name</label>
 <input type="text" value={extField2} onChange={(e) => setExtField2(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="Full name" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Parent Phone</label>
 <input type="text" value={extField3} onChange={(e) => setExtField3(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="+91..." />
 </div>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-5">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Contact Phone</label>
 <input type="text" value={extField1} onChange={(e) => setExtField1(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="+91..." />
 </div>
 <div className="grid grid-cols-2 gap-5">
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Department</label>
 <input type="text" value={extField2} onChange={(e) => setExtField2(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm" placeholder="e.g. Law Faculty" />
 </div>
 <div className="flex flex-col gap-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">Faculty Type</label>
 <select value={extField3} onChange={(e) => setExtField3(e.target.value)} className="w-full bg-themePanel dark:bg-themeApp border border-themeBorder dark:border-white/[0.08] focus:border-themeAccent rounded-xl py-3.5 px-4 text-xs font-bold text-themeText outline-none transition shadow-sm appearance-none">
 <option value="">Select Type</option>
 <option value="Full-Time">Full-Time</option>
 <option value="Part-Time">Part-Time</option>
 <option value="Visiting">Visiting</option>
 </select>
 </div>
 </div>
 </div>
 )}
 </div>
 
 <button type="button" onClick={handleSaveExtendedInfo} disabled={isSavingExtended} className="w-full py-4 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeApp text-[13px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-themeAccent/20 flex items-center justify-center gap-2">
 {isSavingExtended ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-floppy-disk"></i> Save Extended Info</>}
 </button>
 </div>
 </div>
 ) : (
 <div className="flex-1 flex items-center justify-center flex-col text-center p-8 opacity-50">
 <i className="fa-solid fa-id-card-clip text-5xl text-themeTextSec mb-4"></i>
 <h3 className="text-lg font-bold text-themeText">Awaiting Provisioning</h3>
 <p className="text-xs font-medium text-themeTextSec mt-2 max-w-xs">Create an account on the left to unlock extended editing, photo cropping, and metadata management.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
