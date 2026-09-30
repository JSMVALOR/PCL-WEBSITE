CREATE TABLE public.whatsapp_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.whatsapp_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all users" ON public.whatsapp_queue FOR ALL USING (true);
