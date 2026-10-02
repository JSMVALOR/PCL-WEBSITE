-- Run this to update the whatsapp_queue table
ALTER TABLE public.whatsapp_queue
ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS template_id VARCHAR(100);

-- Run this to update the academic_batches table (for Group Assignments tab)
ALTER TABLE public.academic_batches
ADD COLUMN IF NOT EXISTS whatsapp_group_id VARCHAR(255);
