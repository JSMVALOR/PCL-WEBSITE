-- Update admissions_applications table with absolutely ALL columns
ALTER TABLE admissions_applications
ADD COLUMN IF NOT EXISTS marks_10th TEXT,
ADD COLUMN IF NOT EXISTS marks_inter TEXT,
ADD COLUMN IF NOT EXISTS exam_tglawcet TEXT,
ADD COLUMN IF NOT EXISTS exam_clat TEXT,
ADD COLUMN IF NOT EXISTS exam_other TEXT,
ADD COLUMN IF NOT EXISTS family_in_legal TEXT,
ADD COLUMN IF NOT EXISTS family_in_legal_who TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'website',
ADD COLUMN IF NOT EXISTS erp_id TEXT,
ADD COLUMN IF NOT EXISTS program TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Trigger a schema cache reload for Supabase PostgREST
NOTIFY pgrst, 'reload schema';
