-- Run this in your Supabase SQL Editor to fix the WhatsApp Engine group sending issue
ALTER TABLE whatsapp_queue ALTER COLUMN phone TYPE text;
