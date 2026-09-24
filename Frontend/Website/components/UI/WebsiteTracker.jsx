/* © 2026 JSM VALOR. All Rights Reserved. */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../Shared/lib/supabase/supabaseClient'; // Adjusted relative path assuming src/COMPONENTS/UI/WebsiteTracker.jsx

export default function WebsiteTracker() {
    const location = useLocation();
    
    // We only want to generate a session_id once per visit
    const sessionIdRef = useRef(null);

    useEffect(() => {
        // Initialize or retrieve session ID
        if (!sessionStorage.getItem('website_session_id')) {
            sessionStorage.setItem('website_session_id', 'sess_' + Math.random().toString(36).substring(2, 15));
        }
        sessionIdRef.current = sessionStorage.getItem('website_session_id');
    }, []);

    // Track Page Views
    useEffect(() => {
        const path = location.pathname;
        
        // Exclude ERP paths from tracking
        if (path.startsWith('/erp')) return;

        const trackPageView = async () => {
            try {
                if (!sessionIdRef.current) return;
                
                await supabase.from('website_page_views').insert([{
                    session_id: sessionIdRef.current,
                    path: path
                }]);
            } catch (error) {
                console.error("Tracking Error (Page View):", error);
            }
        };

        // Add a small delay so we don't spam requests if user navigates away instantly
        const timeout = setTimeout(() => {
            trackPageView();
        }, 1000);

        return () => clearTimeout(timeout);
    }, [location.pathname]);

    // Track Global Clicks
    useEffect(() => {
        const handleClick = async (e) => {
            // Only care about actual interactive elements
            const target = e.target.closest('a, button, [role="button"], .trackable');
            
            if (!target) return;
            
            // Do not track within the ERP
            if (location.pathname.startsWith('/erp')) return;

            let elementText = target.innerText || target.getAttribute('aria-label') || target.getAttribute('title') || target.tagName;
            elementText = elementText.trim().substring(0, 50); // limit length
            
            if (!elementText) return;

            try {
                if (!sessionIdRef.current) return;

                await supabase.from('website_clicks').insert([{
                    session_id: sessionIdRef.current,
                    path: location.pathname,
                    element_text: elementText
                }]);
            } catch (error) {
                console.error("Tracking Error (Click):", error);
            }
        };

        document.addEventListener('click', handleClick);
        
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [location.pathname]);

    // Render nothing as this is purely logical
    return null;
}
