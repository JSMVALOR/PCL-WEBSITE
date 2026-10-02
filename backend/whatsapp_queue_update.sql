-- Run this to update the whatsapp_queue table
ALTER TABLE public.whatsapp_queue
ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS template_id VARCHAR(100);
