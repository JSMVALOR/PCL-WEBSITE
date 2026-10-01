/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';
import { sendSystemEmail } from '../../lib/EmailService';

export default function ForgotPasswordModal({ onClose }) {
 const [step, setStep] = useState('id'); // 'id', 'otp', 'password', 'success'
 
 const [institutionalId, setInstitutionalId] = useState('');
 const [email, setEmail] = useState('');
 const [userId, setUserId] = useState(null);
 
 const [otpValue, setOtpValue] = useState(['', '', '', '']);
 const otpInputRefs = [useRef(), useRef(), useRef(), useRef()];
 const expectedOtpRef = useRef('');
 
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState('');
 
 const handleIdSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 setError('');
 
 try {
 let cleanCredential = institutionalId.toLowerCase().trim();
 let emailToLogin = cleanCredential;
 
 if (!cleanCredential.includes('@')) {
 if (cleanCredential === 'admin' || cleanCredential === 'principal' || cleanCredential === 'adm0001') {
 emailToLogin = 'principal@prudentiacollegeoflaw.com';
 } else if (cleanCredential === 'fac0000') {
 emailToLogin = 'fac0000@pcl.edu';
 } else {
 emailToLogin = `${cleanCredential}_v2@jsm.edu`;
 }
 }
 
 const generated = Math.floor(1000 + Math.random() * 9000).toString();
 expectedOtpRef.current = generated;
 
 const { data: profile } = await supabase.from('profiles').select('id').eq('email', emailToLogin).maybeSingle();
 
 if (profile) {
 setUserId(profile.id);
 }
 
 setEmail(emailToLogin);
 
 await sendSystemEmail('RECOVERY_OTP', {
 to_email: emailToLogin,
 otp: generated
 });
 
 setStep('otp');
 } catch (err) {
 console.error(err);
 setError('Failed to initiate reset. Please check your ID and try again.');
 } finally {
 setIsSubmitting(false);
 }
 };
 
 const handleOtpChange = (index, value) => {
 if (!/^\d*$/.test(value)) return;
 
 const newOtp = [...otpValue];
 newOtp[index] = value;
 setOtpValue(newOtp);
 
 if (value !== '' && index < 3) {
 otpInputRefs[index + 1].current?.focus();
 }
 
 if (newOtp.every(v => v !== '')) {
 const code = newOtp.join('');
 if (code === expectedOtpRef.current || code === '1234') { // 1234 for testing fallback
 setStep('password');
 setError('');
 } else {
 setError('Invalid OTP code. Please try again.');
 }
 }
 };
 
 const handleOtpKeyDown = (index, e) => {
 if (e.key === 'Backspace' && otpValue[index] === '' && index > 0) {
 otpInputRefs[index - 1].current?.focus();
 }
 };
 
 const handlePasswordSubmit = async (e) => {
 e.preventDefault();
 
 if (newPassword !== confirmPassword) {
 setError('Passwords do not match.');
 return;
 }
 
 if (newPassword.length < 8) {
 setError('Password must be at least 8 characters long.');
 return;
 }
 
 setIsSubmitting(true);
 setError('');
 
 try {
 if (userId) {
 const { error: rpcError } = await supabase.rpc('admin_reset_password', {
 target_user_id: userId,
 new_password: newPassword
 });
 
 if (rpcError) throw rpcError;
 setStep('success');
 } else {
 throw new Error("User ID not found for this account.");
 }
 } catch (err) {
 console.error(err);
 setError(`Update failed: ${err.message || 'System policy restricts this action.'}`);
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[200] flex flex-col bg-themeApp animate-fade-in font-sans overflow-y-auto">
 <button 
 aria-label="Action button" type="button"
 onClick={onClose}
 className="fixed top-6 right-6 lg:top-10 lg:right-10 w-12 h-12 rounded-md bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated hover:bg-themeBorder border border-themeBorder flex items-center justify-center text-themeTextSec hover:text-themeText transition outline-none z-[250] shadow-2xl cursor-pointer hover:scale-110"
 ><i className="fa-solid fa-times text-xl"></i></button>

 <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-md bg-themeAccent opacity-[0.05] mix-blend-screen filter blur-[120px] animate-pulse-slow"></div>
 </div>

 <div className="w-full max-w-xl mx-auto p-6 lg:p-12 min-h-screen flex flex-col justify-center relative z-10">
 <div className="mb-8 relative z-10 border-b border-themeBorder pb-8">
 <div className="w-14 h-14 rounded-lg bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-themeBorder flex items-center justify-center mb-6 shadow-inner">
 <i className={`fa-solid ${step === 'success' ? 'fa-check text-emerald-500' : 'fa-shield-halved text-themeAccent'} text-2xl`}></i>
 </div>
 <h2 className="text-3xl font-black tracking-tight text-themeText mb-3">
 {step === 'id' && "Account Recovery"}
 {step === 'otp' && "Verify OTP"}
 {step === 'password' && "New Passcode"}
 {step === 'success' && "Passcode Reset"}
 </h2>
 <p className="text-sm font-bold text-themeTextSec leading-relaxed">
 {step === 'id' && "Enter your Institutional ID (UD) to receive a secure recovery code via email."}
 {step === 'otp' && `We've sent a 4-digit code to your registered email. Please enter it below.`}
 {step === 'password' && "Create a strong, new passcode for your account."}
 {step === 'success' && "Your passcode has been successfully updated. You may now return to login."}
 </p>
 </div>

 <div className="bg-themePanel/40 backdrop-blur-3xl border border-themeBorder p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
 {error && (
 <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold flex items-start gap-3 mb-6 overflow-hidden">
 <i className="fa-solid fa-circle-exclamation shrink-0 mt-0.5"></i> 
 <span className="leading-relaxed break-words break-all">{error}</span>
 </div>
 )}

 {step === 'id' && (
 <form onSubmit={handleIdSubmit} className="flex flex-col gap-6 relative z-10">
 <div className="flex flex-col gap-3">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
 Institutional ID (UD)
 </label>
 <input
 type="text"
 value={institutionalId}
 onChange={(e) => setInstitutionalId(e.target.value)}
 className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl py-4 px-5 text-sm font-bold text-themeText uppercase outline-none transition placeholder:text-themeTextSec/50 placeholder:font-normal placeholder:normal-case shadow-inner"
 placeholder="e.g. PCL-STU-2026"
 required
 />
 </div>

 <button
 type="submit"
 disabled={isSubmitting || !institutionalId}
 className="w-full py-4 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeApp text-[13px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:shadow-themeAccent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {isSubmitting ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Sending Code...</>
 ) : (
 <>Send OTP Code <i className="fa-solid fa-paper-plane"></i></>
 )}
 </button>
 </form>
 )}

 {step === 'otp' && (
 <div className="flex flex-col gap-8 relative z-10">
 <div className="flex justify-center gap-3 md:gap-4">
 {[0, 1, 2, 3].map((index) => (
 <input
 key={index}
 ref={otpInputRefs[index]}
 type="text"
 maxLength={1}
 value={otpValue[index]}
 onChange={(e) => handleOtpChange(index, e.target.value)}
 onKeyDown={(e) => handleOtpKeyDown(index, e)}
 className="w-14 h-16 md:w-16 md:h-20 bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-xl text-center text-2xl font-black text-themeText outline-none transition-all focus:scale-105 shadow-inner"
 />
 ))}
 </div>
 
 <div className="flex justify-between items-center px-2">
 <button type="button" onClick={() => setStep('id')} className="text-xs font-bold text-themeTextSec hover:text-themeText transition-colors flex items-center gap-2">
 <i className="fa-solid fa-arrow-left"></i> Change ID
 </button>
 <button type="button" onClick={() => handleIdSubmit({preventDefault:()=>{}})} className="text-xs font-bold text-themeAccent hover:text-themeAccent/80 transition-colors flex items-center gap-2">
 <i className="fa-solid fa-rotate-right"></i> Resend OTP
 </button>
 </div>
 </div>
 )}

 {step === 'password' && (
 <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6 relative z-10">
 <div className="flex flex-col gap-3">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
 New Passcode
 </label>
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-xl py-4 px-5 text-sm font-bold text-themeText outline-none transition placeholder:text-themeTextSec/50 placeholder:font-normal shadow-inner"
 placeholder="••••••••"
 required
 />
 </div>
 <div className="flex flex-col gap-3">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-themeTextSec ml-1">
 Confirm Passcode
 </label>
 <input
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full bg-themeElevated border border-themeBorder focus:border-themeAccent rounded-xl py-4 px-5 text-sm font-bold text-themeText outline-none transition placeholder:text-themeTextSec/50 placeholder:font-normal shadow-inner"
 placeholder="••••••••"
 required
 />
 </div>

 <button
 type="submit"
 disabled={isSubmitting || !newPassword || !confirmPassword}
 className="w-full py-4 rounded-xl bg-themeAccent hover:bg-themeAccent/90 text-themeApp text-[13px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:shadow-themeAccent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
 >
 {isSubmitting ? (
 <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Updating...</>
 ) : (
 <>Confirm Update <i className="fa-solid fa-check"></i></>
 )}
 </button>
 </form>
 )}

 {step === 'success' && (
 <div className="flex flex-col gap-6 relative z-10">
 <button
 type="button"
 onClick={onClose}
 className="w-full py-4 rounded-xl bg-themeText text-themeApp text-[13px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
 >
 Return to Login <i className="fa-solid fa-arrow-right"></i>
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
