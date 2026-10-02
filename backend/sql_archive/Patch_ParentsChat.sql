CREATE OR REPLACE POLICY "Users can send messages based on roles"
    ON public.erp_chat_messages
    FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id AND
        (
            -- Student sender: can only send to faculty or admin
            (
                (SELECT role FROM public.profiles WHERE id = sender_id) = 'student' AND
                (SELECT role FROM public.profiles WHERE id = receiver_id) IN ('faculty', 'admin')
            )
            OR
            -- Parent sender: can only send to faculty or admin
            (
                (SELECT role FROM public.profiles WHERE id = sender_id) = 'parent' AND
                (SELECT role FROM public.profiles WHERE id = receiver_id) IN ('faculty', 'admin')
            )
            OR
            -- Faculty sender: can send to student, parent, faculty, admin
            (
                (SELECT role FROM public.profiles WHERE id = sender_id) = 'faculty' AND
                (SELECT role FROM public.profiles WHERE id = receiver_id) IN ('student', 'parent', 'faculty', 'admin')
            )
            OR
            -- Admin sender: can send to anyone
            (
                (SELECT role FROM public.profiles WHERE id = sender_id) = 'admin'
            )
        )
    );
