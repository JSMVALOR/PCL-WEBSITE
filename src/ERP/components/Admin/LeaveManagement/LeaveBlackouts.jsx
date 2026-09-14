/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function LeaveBlackouts() {
    const [blackouts, setBlackouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBlackouts();
    }, []);

    const fetchBlackouts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('academic_calendar')
                .select('*')
                .eq('type', 'leave_blackout')
                .order('start_date', { ascending: true });
            
            if (error) throw error;
            setBlackouts(data || []);
        } catch (error) {
            console.error("Error fetching blackouts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBlackout = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title,
                type: 'leave_blackout',
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                description: 'Faculty leaves are locked during this period.'
            };
            const { error } = await supabase.from('academic_calendar').insert([payload]);
            if (error) throw error;
            
            window.erpDialog?.alert("Blackout period successfully locked.");
            setTitle("");
            setStartDate("");
            setEndDate("");
            fetchBlackouts();
        } catch (error) {
            console.error("Error adding blackout:", error);
            window.erpDialog?.alert("Failed to lock dates.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this blackout period? Leaves will be allowed again.")) return;
        try {
            const { error } = await supabase.from('academic_calendar').delete().eq('id', id);
            if (error) throw error;
            fetchBlackouts();
        } catch (error) {
            console.error("Error deleting blackout:", error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
            {/* Left: Add Form */}
            <div className="w-full lg:w-1/3 flex flex-col gap-5">
                <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-6">
                    <h2 className="text-lg font-black text-themeText mb-1"><i className="fa-solid fa-lock text-rose-500 mr-2"></i> Lock Dates</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-themeTextSec mb-5">Prevent faculty from requesting leaves</p>
                    
                    <form onSubmit={handleAddBlackout} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Event / Reason</label>
                            <input type="text" required placeholder="e.g. Annual Fest, Exams" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText focus:border-rose-500 outline-none transition" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Start Date</label>
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText focus:border-rose-500 outline-none transition" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">End Date (Inclusive)</label>
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl saturate-[1.8] shadow-sm border border-black/[0.04] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-themeText focus:border-rose-500 outline-none transition" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="mt-2 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40">
                            {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-shield-halved"></i> Lock Period</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right: List */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                {isLoading ? (
                    <div className="w-full py-12 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-rose-500"></i></div>
                ) : blackouts.length === 0 ? (
                    <div className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-10 text-center flex flex-col items-center">
                        <i className="fa-solid fa-calendar-check text-4xl text-themeTextSec opacity-50 mb-4"></i>
                        <h3 className="text-sm font-black text-themeText">No Locked Dates</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-1">Leaves are currently open 365 days a year.</p>
                    </div>
                ) : (
                    blackouts.map(b => (
                        <div key={b.id} className="bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-3xl saturate-[1.8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-black/[0.04] dark:border-white/[0.08] rounded-2xl p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                            <div>
                                <h3 className="text-base font-black text-themeText">{b.title}</h3>
                                <p className="text-xs font-semibold text-themeTextSec mt-1">
                                    <i className="fa-regular fa-calendar mr-1.5"></i> 
                                    {new Date(b.start_date).toLocaleDateString('en-GB')} to {new Date(b.end_date).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                            <button onClick={() => handleDelete(b.id)} className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-themeTextSec border border-black/[0.04] dark:border-white/[0.08] rounded-lg text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2">
                                <i className="fa-solid fa-unlock"></i> Unlock
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
