-- Create the erp_chat_messages table
CREATE TABLE IF NOT EXISTS public.erp_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.erp_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages where they are the sender or receiver
CREATE POLICY "Users can view their own chats" 
    ON public.erp_chat_messages
    FOR SELECT 
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Allow inserts based on roles
CREATE POLICY "Users can send messages based on roles"
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
            -- Faculty sender: can send to student, faculty, admin
            (
                (SELECT role FROM public.profiles WHERE id = sender_id) = 'faculty' AND
                (SELECT role FROM public.profiles WHERE id = receiver_id) IN ('student', 'faculty', 'admin')
            )
            OR
            -- Admin sender: can send to anyone
            (
                (SELECT role FROM public.profiles WHERE id = sender_id) = 'admin'
            )
        )
    );

-- Policy: Users can update read_status of messages sent TO them
CREATE POLICY "Users can update read status of received messages"
    ON public.erp_chat_messages
    FOR UPDATE 
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- Add to replication for realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.erp_chat_messages;
