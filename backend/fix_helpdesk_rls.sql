-- Enable RLS for helpdesk tickets if not already
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own tickets (needed for replying)
CREATE POLICY "Users can update own tickets" 
ON public.helpdesk_tickets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Also ensure admins can update all tickets
CREATE POLICY "Admins can update all tickets" 
ON public.helpdesk_tickets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
