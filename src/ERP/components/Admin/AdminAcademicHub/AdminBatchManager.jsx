import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { theme } from '../../../../Shared/theme';

export default function AdminBatchManager({ isEmbedded = false }) {
 const [batches, setBatches] = useState([]);
 const [loading, setLoading] = useState(true);
 const [isCreating, setIsCreating] = useState(false);
 
 // Form State
 const [name, setName] = useState('');
 const [program, setProgram] = useState('');
 const [startYear, setStartYear] = useState('');
 const [gradYear, setGradYear] = useState('');
 const [whatsappGroupId, setWhatsappGroupId] = useState('');

 const fetchBatches = async () => {
 setLoading(true);
 try {
 const { data, error } = await supabase
 .from('academic_batches')
 .select('*')
 .order('start_year', { ascending: false });
 
 if (error) throw error;
 setBatches(data || []);
 } catch (err) {
 console.error("Failed to fetch batches:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchBatches();
 }, []);

 const handleCreate = async (e) => {
 e.preventDefault();
 try {
 const { error } = await supabase
 .from('academic_batches')
 .insert([{ 
 name, 
 program, 
 start_year: parseInt(startYear), 
 graduation_year: parseInt(gradYear),
 whatsapp_group_id: whatsappGroupId || null
 }]);
 
 if (error) throw error;
 
 setIsCreating(false);
 setName('');
 setProgram('');
 setStartYear('');
 setGradYear('');
 setWhatsappGroupId('');
 fetchBatches();
 window.erpDialog?.alert("Batch created successfully.");
 } catch (err) {
 console.error("Failed to create batch:", err);
 window.erpDialog?.alert("Error creating batch. Make sure the name is unique.");
 }
 };

 const handleDelete = async (id) => {
 const confirm = window.confirm("Are you sure you want to delete this batch? (Ensure no students are currently assigned to it)");
 if (!confirm) return;

 try {
 const { error } = await supabase
 .from('academic_batches')
 .delete()
 .eq('id', id);
 
 if (error) throw error;
 fetchBatches();
 } catch (err) {
 console.error("Failed to delete batch:", err);
 window.erpDialog?.alert("Error deleting batch.");
 }
 };

 return (
 <div className="flex flex-col gap-6 animate-fade-in relative">
 <div className="flex justify-between items-center bg-themePanel/85 backdrop-blur-2xl p-6 rounded-2xl border border-white/5">
 <div>
 <h2 className="text-xl font-black text-themeText">Batch Manager</h2>
 <p className="text-xs font-bold text-themeTextSec mt-1">Manage academic cohorts and WhatsApp broadcast groups.</p>
 </div>
 <button onClick={() => setIsCreating(!isCreating)} className="bg-themeAccent text-themeApp px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
 {isCreating ? <><i className="fa-solid fa-xmark mr-2"></i> Cancel</> : <><i className="fa-solid fa-plus mr-2"></i> Create Batch</>}
 </button>
 </div>

 {isCreating && (
 <form onSubmit={handleCreate} className="bg-themeElevated/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4 animate-fade-in">
 <h3 className="text-sm font-black text-themeText mb-2">Create New Academic Batch</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Batch Target Name (Exact match for DB)</label>
 <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. 2026-2031" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Program</label>
 <input type="text" value={program} onChange={e => setProgram(e.target.value)} required placeholder="e.g. BBA LLB (Hons.)" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">WhatsApp Group ID</label>
 <input type="text" value={whatsappGroupId} onChange={e => setWhatsappGroupId(e.target.value)} placeholder="e.g. +919876543210 (Optional)" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Start Year</label>
 <input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} required placeholder="2026" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 <div>
 <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 block">Graduation Year</label>
 <input type="number" value={gradYear} onChange={e => setGradYear(e.target.value)} required placeholder="2031" className="w-full bg-themePanel/85 backdrop-blur-2xl border border-white/5 focus:border-themeAccent rounded-xl px-4 py-3 text-sm font-bold text-themeText outline-none" />
 </div>
 </div>
 
 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mt-2 text-xs text-blue-400 font-bold">
 <i className="fa-brands fa-whatsapp mr-2"></i> Ensure your WhatsApp Group ID is a valid phone number (if sending direct) or valid Group ID configured with your API Provider.
 </div>

 <button type="submit" className="btn-erp">
 Save Batch
 </button>
 </form>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {loading ? (
 <div className="col-span-full py-12 text-center text-themeTextSec">
 <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent"></i>
 </div>
 ) : batches.length === 0 ? (
 <div className="col-span-full py-12 text-center bg-themePanel/85 backdrop-blur-2xl rounded-xl border border-white/5">
 <p className="text-sm font-bold text-themeTextSec">No batches found. Create one to begin.</p>
 </div>
 ) : (
 batches.map((batch) => (
 <div key={batch.id} className="bg-themePanel/85 backdrop-blur-2xl border border-white/5 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-black/5 dark:border-white/10 transition-colors">
 <div className="absolute top-0 left-0 w-1 h-full bg-themeAccent"></div>
 
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-lg font-black text-themeText">{batch.name}</h3>
 <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{batch.program}</p>
 </div>
 <button onClick={() => handleDelete(batch.id)} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white">
 <i className="fa-solid fa-trash text-xs"></i>
 </button>
 </div>

 <div className="flex items-center gap-2 mt-2">
 <span className="bg-themeElevated/90 backdrop-blur-2xl border border-white/5 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">Start: {batch.start_year}</span>
 <span className="bg-themeElevated/90 backdrop-blur-2xl border border-white/5 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">Grad: {batch.graduation_year}</span>
 </div>

 <div className="mt-auto border-t border-white/5 pt-4">
 <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1"><i className="fa-brands fa-whatsapp text-emerald-500 mr-1"></i> WhatsApp Integration</p>
 <p className="text-xs font-mono text-themeText">{batch.whatsapp_group_id || <span className="text-themeTextSec/50 italic">Not Linked</span>}</p>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 );
}
