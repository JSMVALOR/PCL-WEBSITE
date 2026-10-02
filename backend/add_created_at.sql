-- Add created_at column to admissions_applications
ALTER TABLE admissions_applications 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
