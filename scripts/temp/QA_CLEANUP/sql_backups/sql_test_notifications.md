```sql
-- Replace 'user@example.com' with the email of the user you are logged in as to test!
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the user ID (Change the email here to the account you are testing with)
    SELECT id INTO test_user_id FROM public.users LIMIT 1; 
    -- Note: We are just grabbing the first user for the script, but in reality you might want to filter by email:
    -- SELECT id INTO test_user_id FROM public.users WHERE email = 'test@example.com' LIMIT 1;

    IF test_user_id IS NOT NULL THEN
        -- 1. Leave Approval Notification
        INSERT INTO public.notifications (recipient_id, title, message, type, action_link)
        VALUES (test_user_id, 'Leave Request Approved', 'Your leave request for 24th Sept has been approved by the HOD.', 'leave', 'facultyleave');

        -- 2. Mentorship Message Notification
        INSERT INTO public.notifications (recipient_id, title, message, type, action_link)
        VALUES (test_user_id, 'New Message from Mentee', 'John Doe sent you a new message regarding their academic progress.', 'message', 'mentorship');

        -- 3. Attendance Warning Notification
        INSERT INTO public.notifications (recipient_id, title, message, type, action_link)
        VALUES (test_user_id, 'Attendance Alert', 'Warning: Your attendance in Constitutional Law has dropped below 75%.', 'attendance', 'attendance');

        -- 4. Upcoming Meeting Notification
        INSERT INTO public.notifications (recipient_id, title, message, type, action_link)
        VALUES (test_user_id, 'Upcoming Mentorship Session', 'You have a mentorship meeting scheduled tomorrow at 10:00 AM.', 'meeting', 'mentorship');

        -- 5. Payroll / System Notification
        INSERT INTO public.notifications (recipient_id, title, message, type, action_link)
        VALUES (test_user_id, 'Payslip Generated', 'Your payslip for the month of September is now available for download.', 'system', 'payroll');
        
        RAISE NOTICE 'Test notifications injected successfully for user %', test_user_id;
    ELSE
        RAISE EXCEPTION 'No user found to inject notifications to.';
    END IF;
END $$;
```
