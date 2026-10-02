-- Update admissions_applications table with ALL required columns
ALTER TABLE admissions_applications
ADD COLUMN IF NOT EXISTS family_in_legal TEXT,
ADD COLUMN IF NOT EXISTS family_in_legal_who TEXT,
ADD COLUMN IF NOT EXISTS exam_tglawcet TEXT,
ADD COLUMN IF NOT EXISTS exam_clat TEXT,
ADD COLUMN IF NOT EXISTS exam_other TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website';

-- Supabase Data API (PostgREST) caches the schema. 
-- You might need to trigger a schema cache reload.
NOTIFY pgrst, 'reload schema';
