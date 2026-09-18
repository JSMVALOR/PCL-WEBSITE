/* © 2026 JSM VALOR. All Rights Reserved. */
import { useState, useEffect, useContext } from 'react';
import { PreviewContext } from '../../../Website/context/PreviewContext';
import { supabase } from '../../lib/supabase/supabaseClient';

export function useSiteContent(pagePath, sectionName) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const previewCtx = useContext(PreviewContext);

    useEffect(() => {
        // If preview data exists for this specific section, use it instantly (no fetch needed)
        const previewKey = `${pagePath}::${sectionName}`;
        if (previewCtx && previewCtx.previewData && previewCtx.previewData[previewKey]) {
            setContent(previewCtx.previewData[previewKey]);
            setLoading(false);
            return;
        }

        async function fetchContent() {
            try {
                const { data, error: fetchError } = await supabase
                    .from('website_content')
                    .select('content_data')
                    .eq('page_path', pagePath)
                    .eq('section_id', sectionName)
                    .maybeSingle();

                if (fetchError) throw fetchError;
                
                if (data && data.content_data) {
                    setContent(data.content_data);
                }
            } catch (err) {
                console.error(`Failed to fetch content for ${pagePath} - ${sectionName}:`, err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, [pagePath, sectionName, previewCtx?.previewData]);

    return { content, loading, error };
}
