-- =======================================================================================
-- 1. ADMISSIONS FORM FIXES 
-- (Allows public users to submit applications from the Website)
-- =======================================================================================

CREATE TABLE IF NOT EXISTS public.admissions_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    program text NOT NULL,
    family_in_legal text,
    family_in_legal_who text,
    marks_10th text,
    marks_inter text,
    exam_tglawcet text,
    exam_clat text,
    exam_other text,
    status text DEFAULT 'pending',
    source text DEFAULT 'website',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Admissions
ALTER TABLE public.admissions_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (since they are applying from public website)
DROP POLICY IF EXISTS "Allow anonymous insert for admissions" ON public.admissions_applications;
CREATE POLICY "Allow anonymous insert for admissions" ON public.admissions_applications
    FOR INSERT WITH CHECK (true);


-- =======================================================================================
-- 2. NOTIFICATIONS & MENTORSHIP RLS FIXES 
-- (Fixes issue where 'Mark as Read' reverted back to unread on page refresh)
-- =======================================================================================

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Allow users to update their own notifications (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Enable RLS for Mentorship Messages
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own received messages (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update own received messages" ON public.mentorship_messages;
CREATE POLICY "Users can update own received messages" ON public.mentorship_messages
    FOR UPDATE USING (receiver_id = auth.uid());
