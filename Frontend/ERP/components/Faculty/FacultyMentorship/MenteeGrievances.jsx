/* © 2026 JSM VALOR. All Rights Reserved. Proprietary and Confidential. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../Shared/lib/supabase/supabaseClient';

export default function MenteeGrievances({ menteeId }) {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(menteeId) fetchGrievances();
    }, [menteeId]);

    const fetchGrievances = async () => {
        setLoading(true);
        try {
            // Fetch grievances where mentee is either the reporter or accused
            const { data } = await supabase
                .from('grievances')
                .select('*')
                .or(`reporter_id.eq.${menteeId},accused_id.eq.${menteeId}`)
                .order('created_at', { ascending: false });
            if (data) setGrievances(data);
        } catch (e) { console.error(e); if (window.toast) window.toast.error("An error occurred. Please try again."); } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black tracking-tight text-themeText">Grievance Record</h2>
                <p className="text-xs font-bold text-themeTextSec mt-1">Official reports filed by or against this mentee.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><i className="fa-solid fa-circle-notch fa-spin text-themeTextSec text-2xl"></i></div>
            ) : grievances.length === 0 ? (
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 p-10 text-center flex flex-col items-center">
                    <i className="fa-solid fa-shield-halved text-3xl text-emerald-500/50 mb-3"></i>
                    <p className="text-sm font-bold text-themeTextSec tracking-tight">Clean Record</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec/60 mt-1">No grievances found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {grievances.map(g => {
                        const isAccused = g.accused_id === menteeId;
                        return (
                            <div key={g.id} className={`p-5 rounded-2xl border ${isAccused ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/50 dark:bg-themePanel/50 border-themeBorder'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${isAccused ? 'bg-rose-500 text-white' : 'bg-themeAccent/20 text-themeAccent'}`}>
                                            {isAccused ? 'Accused' : 'Filer'}
                                        </span>
                                        <span className="text-[10px] font-bold text-themeTextSec">{new Date(g.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest border border-themeBorder px-2 py-1 rounded-md">{g.status}</span>
                                </div>
                                <h4 className="text-sm font-black text-themeText">{g.category}</h4>
                                <p className="text-xs text-themeTextSec mt-1">{g.description}</p>
                                {g.resolution_notes && (
                                    <div className="mt-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-themeBorder text-xs text-themeText">
                                        <span className="font-bold">Resolution:</span> {g.resolution_notes}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
