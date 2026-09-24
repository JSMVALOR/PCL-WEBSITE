```sql
-- 1. Drop existing table to fix column mismatch (Safe because it's currently empty!)
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 2. Create the Table with the CORRECT schema
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    action_link TEXT,
    is_read BOOLEAN DEFAULT false
);

-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (recipient_id = (SELECT id FROM public.profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email' OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications FOR UPDATE
    USING (recipient_id = (SELECT id FROM public.profiles WHERE email = current_setting('request.jwt.claims', true)::json->>'email' OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);
    
-- 4. Turn on Realtime for the table safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END
$$;

-- 5. Inject Dummy Notifications to test the UI!
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1; 

    IF test_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (recipient_id, title, message, type, action_link)
        VALUES 
        (test_user_id, 'Leave Request Approved', 'Your leave request for 24th Sept has been approved.', 'leave', 'facultyleave'),
        (test_user_id, 'New Message from Mentee', 'John Doe sent you a new message regarding their academic progress.', 'message', 'mentorship'),
        (test_user_id, 'Attendance Alert', 'Warning: Your attendance in Constitutional Law has dropped below 75%.', 'attendance', 'attendance'),
        (test_user_id, 'Upcoming Mentorship Session', 'You have a mentorship meeting scheduled tomorrow at 10:00 AM.', 'meeting', 'mentorship'),
        (test_user_id, 'Payslip Generated', 'Your payslip for the month of September is now available.', 'system', 'payroll');
        
        RAISE NOTICE 'Test notifications injected successfully for profile %', test_user_id;
    ELSE
        RAISE EXCEPTION 'No user found in public.profiles to inject notifications to.';
    END IF;
END $$;
```
