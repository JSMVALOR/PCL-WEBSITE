import React, { useState } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';
import { useERP } from '../../../context/ErpContext';

export default function MenteeReport({ menteeId, menteeName, setMenteeTab }) {
    const { userSession } = useERP();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ category: 'Academics', description: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('grievances').insert({
                reporter_id: userSession.db_id,
                accused_id: menteeId,
                category: formData.category,
                description: formData.description,
                status: 'pending'
            });
            if (error) throw error;
            window.erpDialog?.alert("Report successfully filed with Admin.");
            setMenteeTab('grievances');
        } catch (e) {
            console.error(e);
            window.erpDialog?.alert("Failed to submit report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black tracking-tight text-rose-500 flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation"></i> File Disciplinary Report
                </h2>
                <p className="text-xs font-bold text-themeTextSec mt-1">Submit an official report against <span className="text-themeText">{menteeName}</span>. This will be escalated to central Admin.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Category</label>
                    <select 
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-themeElevated border border-themeBorder rounded-xl p-3 text-sm text-themeText focus:border-rose-500 outline-none transition-colors"
                    >
                        <option value="Academics">Academic Misconduct</option>
                        <option value="Discipline">Disciplinary / Behavioral</option>
                        <option value="Attendance">Chronic Absenteeism</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Report Details</label>
                    <textarea 
                        required
                        placeholder="Provide detailed context for this report..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full h-32 bg-themeElevated border border-themeBorder rounded-xl p-3 text-sm text-themeText focus:border-rose-500 outline-none transition-colors resize-none"
                    ></textarea>
                </div>
                <button 
                    type="submit" 
                    disabled={loading || !formData.description}
                    className="w-full py-4 rounded-xl bg-rose-500 text-white font-black text-sm tracking-tight hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Submit Official Report'}
                </button>
            </form>
        </div>
    );
}
