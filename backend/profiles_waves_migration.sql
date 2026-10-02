-- Add Joining Date and Admission Type to Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS admission_type TEXT DEFAULT 'Regular';

-- Optional: Update existing records to have a safe default joining date
-- (assuming the academic year started recently, e.g., Sept 1, 2026, or just keep CURRENT_DATE)
-- UPDATE profiles SET joining_date = '2026-09-01' WHERE joining_date = CURRENT_DATE;
