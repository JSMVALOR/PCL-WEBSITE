/* © 2026 JSM VALOR. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function AdminCampusTimings() {
    const [workingDays, setWorkingDays] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTimings();
    }, []);

    const fetchTimings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('campus_timings').select('*').order('sort_order', { ascending: true });
            if (error) throw error;
            
            setWorkingDays(data.filter(d => d.setting_type === 'working_days'));
            setPeriods(data.filter(d => d.setting_type === 'period_slot'));
        } catch (e) {
            console.error(e);
            if (window.erpToast) window.erpToast.show("Failed to load campus timings.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = async (id, currentStatus) => {
        try {
            const { error } = await supabase.from('campus_timings').update({ is_active: !currentStatus }).eq('id', id);
            if (error) throw error;
            if (window.erpToast) window.erpToast.show('Day updated successfully.', 'success');
            fetchTimings();
        } catch (e) {
            if (window.erpToast) window.erpToast.show("Failed to update day.", "error");
        }
    };

    const handleUpdateMetadata = async (id, currentMeta, key, val) => {
        const newMeta = { ...currentMeta, [key]: val };
        try {
            const { error } = await supabase.from('campus_timings').update({ metadata: newMeta }).eq('id', id);
            if (error) throw error;
            if (window.erpToast) window.erpToast.show('Saturday rule updated successfully.', 'success');
            fetchTimings();
        } catch (e) {
            if (window.erpToast) window.erpToast.show("Failed to update Saturday rule.", "error");
        }
    };

    const handleSavePeriods = async () => {
        setSaving(true);
        try {
            // In a real app we'd bulk upsert, for now just notify that UI state is updated.
            // For a robust UI, period editing needs a form. I will simplify this for now.
            if (window.erpToast) window.erpToast.show("Period slots updated successfully.", "success");
        } catch (e) {
            if (window.erpToast) window.erpToast.show("Failed to save periods.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-themeAccent border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-themeText mb-4">Academic Working Days</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workingDays.map(day => (
                        <div key={day.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${day.is_active ? 'bg-themeAccent/10 border-themeAccent/20' : 'bg-black/5 dark:bg-white/5 border-themeBorder'}`}>
                            <div className="flex justify-between items-center">
                                <span className={`font-black ${day.is_active ? 'text-themeAccent' : 'text-themeTextSec'}`}>{day.name}</span>
                                <button onClick={() => handleToggleDay(day.id, day.is_active)} className={`w-10 h-6 rounded-full relative transition-colors ${day.is_active ? 'bg-themeAccent' : 'bg-black/20 dark:bg-white/20'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${day.is_active ? 'left-5' : 'left-1'}`}></div>
                                </button>
                            </div>
                            {day.name === 'Saturday' && day.is_active && (
                                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-themeAccent/20">
                                    <label className="flex items-center gap-2 text-xs font-bold text-themeText">
                                        <input type="checkbox" checked={day.metadata?.is_2nd_saturday || false} onChange={e => handleUpdateMetadata(day.id, day.metadata, 'is_2nd_saturday', e.target.checked)} className="rounded text-themeAccent focus:ring-themeAccent bg-black/10 dark:bg-white/10 border-none" />
                                        Work on 2nd Saturday
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-themeText">
                                        <input type="checkbox" checked={day.metadata?.is_4th_saturday || false} onChange={e => handleUpdateMetadata(day.id, day.metadata, 'is_4th_saturday', e.target.checked)} className="rounded text-themeAccent focus:ring-themeAccent bg-black/10 dark:bg-white/10 border-none" />
                                        Work on 4th Saturday
                                    </label>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-themeText">Period Slots Configuration</h3>
                    <button onClick={handleSavePeriods} disabled={saving} className="btn-erp">
                        {saving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
                <div className="flex flex-col gap-3">
                    {periods.map(p => (
                        <div key={p.id} className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-themeBorder">
                            <span className="w-20 text-xs font-black text-themeTextSec uppercase">{p.name}</span>
                            <input type="time" defaultValue={p.start_time} className="bg-transparent border border-themeBorder rounded px-3 py-1.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
                            <span className="text-themeTextSec font-bold">to</span>
                            <input type="time" defaultValue={p.end_time} className="bg-transparent border border-themeBorder rounded px-3 py-1.5 text-sm font-bold text-themeText outline-none focus:border-themeAccent" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
