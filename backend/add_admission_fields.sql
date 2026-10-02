-- Add admission_type to admissions_applications
ALTER TABLE admissions_applications
ADD COLUMN IF NOT EXISTS admission_type TEXT DEFAULT 'Management Quota';

-- Add joining details to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS joining_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS application_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS application_number TEXT,
ADD COLUMN IF NOT EXISTS admission_type TEXT;

NOTIFY pgrst, 'reload schema';
