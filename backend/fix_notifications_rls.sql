-- Enable RLS if not already
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Allow users to update their own notifications (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (recipient_id = auth.uid());


-- Mentorship Messages RLS (if missing)
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own received messages" ON public.mentorship_messages;
CREATE POLICY "Users can update own received messages" ON public.mentorship_messages
    FOR UPDATE USING (receiver_id = auth.uid());
