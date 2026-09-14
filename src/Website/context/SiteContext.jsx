/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../Shared/lib/supabase/supabaseClient';

const SiteContext = createContext();
export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
    const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(true);

    useEffect(() => {
        let isMounted = true;
        // Strip ERP data-theme so website strictly uses system preference
        document.documentElement.removeAttribute('data-theme');
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Fetch initial
        supabase.from('system_settings').select('value').eq('key', 'admissions_status').single()
            .then(({ data, error }) => {
                if (data && !error && isMounted) {
                    setIsAdmissionsOpen(data.value.is_open !== false);
                }
            });

        // Realtime updates
        const channel = supabase.channel('public_settings')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings', filter: 'key=eq.admissions_status' }, (payload) => {
                if (isMounted && payload.new && payload.new.value) {
                    setIsAdmissionsOpen(payload.new.value.is_open !== false);
                }
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <SiteContext.Provider value={{ isAdmissionsOpen }}>
            {children}
        </SiteContext.Provider>
    );
};
