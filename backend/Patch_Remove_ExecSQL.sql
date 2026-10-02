-- 1. Drop the dangerous arbitrary SQL executor
DROP FUNCTION IF EXISTS public.admin_exec_sql(text);

-- 2. Create a safe specific RPC for the Site Editor analytics
CREATE OR REPLACE FUNCTION public.get_top_website_clicks()
RETURNS TABLE(element_text text, click_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT element_text, count(*) as click_count 
    FROM public.website_clicks 
    GROUP BY element_text 
    ORDER BY click_count DESC 
    LIMIT 5;
$$;
