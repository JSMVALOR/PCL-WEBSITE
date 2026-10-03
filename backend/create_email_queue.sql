CREATE TABLE public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    template_id TEXT,
    attachments JSONB
);

-- RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON public.email_queue FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon select" ON public.email_queue FOR SELECT TO anon, authenticated USING (true);
-- Update only for anon is okay for now, but usually restricted to service role
CREATE POLICY "Allow anon update" ON public.email_queue FOR UPDATE TO anon, authenticated USING (true);
