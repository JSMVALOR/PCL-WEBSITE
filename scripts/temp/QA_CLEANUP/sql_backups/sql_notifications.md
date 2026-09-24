```sql
-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    action_link TEXT,
    is_read BOOLEAN DEFAULT false
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (recipient_id = (SELECT id FROM public.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (recipient_id = (SELECT id FROM public.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Anyone can insert (triggers, edge functions, or authenticated users sending messages)
    
-- Turn on realtime
alter publication supabase_realtime add table notifications;
```
