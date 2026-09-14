/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient';

export default function NoticeBanner() {
    const [notices, setNotices] = useState([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const { data, error } = await supabase
                .from('admin_notices')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setNotices(data);
            }
        };

        fetchNotices();

        const channel = supabase.channel('public_notices')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notices' }, () => {
                fetchNotices();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    if (!visible || notices.length === 0) return null;

    const renderNotice = (n, key) => (
        <span key={key} className="text-sm font-medium text-white/90 flex items-center gap-4 shrink-0">
            <span className="text-[var(--primary-color)]/60">•</span>
            {n.title}
            {n.priority === 'urgent' && (
                <span className="bg-rose-500/90 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                    Urgent
                </span>
            )}
        </span>
    );

    return (
        <div
            role="region"
            aria-label="Site announcements"
            className="text-white relative z-50 border-b border-red-900 shadow-lg font-sans"
            style={{ background: 'linear-gradient(90deg, #991b1b, #dc2626, #991b1b)', backgroundSize: '200% auto', animation: 'gradient 10s ease infinite' }}
        >
            <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="flex-shrink-0 bg-white text-red-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Megaphone size={11} strokeWidth={2.5} />
                        Announcements
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        </span>
                    </div>

                    <div className="pcl-notice-viewport flex-1 min-w-0 overflow-hidden relative h-6">
                        <div className="pcl-notice-marquee absolute whitespace-nowrap flex gap-12 items-center h-full" aria-hidden="true">
                            {notices.map((n) => renderNotice(n, n.id))}
                            {notices.map((n) => renderNotice(n, n.id + '-dup'))}
                        </div>

                        {/* Screen-reader accessible, non-animated list */}
                        <span className="sr-only">
                            {notices.map((n) => n.title).join('. ')}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setVisible(false)}
                    aria-label="Dismiss announcements"
                    className="flex-shrink-0 text-white/60 hover:text-[var(--primary-color)] transition-colors p-1 rounded-full hover:bg-white/5"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>

            <style>{`
                .pcl-notice-viewport {
                    mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
                }
                .pcl-notice-marquee {
                    animation: pcl-marquee 30s linear infinite;
                }
                .pcl-notice-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes pcl-marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .pcl-notice-marquee {
                        animation: none;
                        position: static;
                        overflow-x: auto;
                        white-space: nowrap;
                    }
                    .pcl-notice-viewport {
                        overflow-x: auto;
                        mask-image: none;
                        -webkit-mask-image: none;
                    }
                }
            `}</style>
        </div>
    );
}
