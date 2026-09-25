/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from "../../../context/ErpContext";

export default function AdminSystemSettings({}) {
 const { alert } = useERP();
 const [settings, setSettings] = useState({
 lock_days: 7,
 debar_percentage: 75
 });
 const [isSaving, setIsSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchSettings = async () => {
 try {
 const { data, error } = await supabase
 .from('system_settings')
 .select('value')
 .eq('key', 'attendance_config')
 .single();

 if (error && error.code !== 'PGRST116') throw error; // Ignore not found
 if (data && data.value) {
 setSettings({
 lock_days: data.value.lock_days || 7,
 debar_percentage: data.value.debar_percentage || 75
 });
 }
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setLoading(false);
 }
 };
 fetchSettings();
 }, []);

 const handleSave = async (e) => {
 e.preventDefault();
 setIsSaving(true);
 setSaveSuccess(false);
 try {
 const { error } = await supabase
 .from('system_settings')
 .upsert({
 key: 'attendance_config',
 value: settings,
 updated_at: new Date().toISOString()
 }, { onConflict: 'key' });

 if (error) throw error;
 setSaveSuccess(true);
 setTimeout(() => setSaveSuccess(false), 3000);
 } catch (err) { console.error(err); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
 setIsSaving(false);
 }
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center h-64">
 <div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 return (
 <div className="bg-themePanel/85 backdrop-blur-2xl border border-themeBorder dark:border-white/5 rounded-3xl p-6 lg:p-8">
 <div className="mb-8">
 <h2 className="text-2xl font-semibold tracking-tight text-themeText">System Parameters</h2>
 <p className="text-sm font-medium text-themeTextSec mt-1">Configure global rules for attendance, grading, and operations.</p>
 </div>

 <form onSubmit={handleSave} className="max-w-2xl flex flex-col gap-8">
 {/* Attendance Engine Settings */}
 <div className="flex flex-col gap-5 bg-themeApp/50 p-6 rounded-2xl border border-themeBorder dark:border-white/5">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-themeAccent/10 text-themeAccent flex items-center justify-center text-lg">
 <i className="fa-solid fa-clipboard-user"></i>
 </div>
 <h3 className="text-lg font-semibold tracking-tight text-themeText">Attendance Engine</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-lock text-rose-500"></i> Backdate Lock (Days)
 </label>
 <input 
 type="number" 
 min="0"
 max="365"
 required
 value={settings.lock_days}
 onChange={(e) => setSettings({...settings, lock_days: parseInt(e.target.value)})}
 className="bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none transition"
 />
 <p className="text-[10px] text-themeTextSec font-medium">Number of days a faculty can go back to mark attendance before it locks.</p>
 </div>

 <div className="flex flex-col gap-2">
 <label className="text-[13px] font-medium text-themeTextSec flex items-center gap-2">
 <i className="fa-solid fa-triangle-exclamation text-amber-500"></i> Debar Threshold (%)
 </label>
 <input 
 type="number" 
 min="0"
 max="100"
 required
 value={settings.debar_percentage}
 onChange={(e) => setSettings({...settings, debar_percentage: parseInt(e.target.value)})}
 className="bg-themeElevated/90 backdrop-blur-2xl border border-themeBorder dark:border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none transition"
 />
 <p className="text-[10px] text-themeTextSec font-medium">Minimum global attendance % required before a student is flagged.</p>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <button 
 type="submit" 
 disabled={isSaving}
 className="btn-erp disabled:cursor-not-allowed"
 >
 {isSaving ? (
 <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Saving...</span>
 ) : (
 <span><i className="fa-solid fa-floppy-disk mr-2"></i> Save Parameters</span>
 )}
 </button>

 {saveSuccess && (
 <span className="text-xs font-bold text-emerald-500 animate-fade-in flex items-center gap-1.5">
 <i className="fa-solid fa-check-circle"></i> Successfully updated global rules!
 </span>
 )}
 </div>
 </form>
 </div>
 );
}
