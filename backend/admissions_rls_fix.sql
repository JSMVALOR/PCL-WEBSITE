-- Fix RLS Policies for Admissions Applications
ALTER TABLE admissions_applications ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting existing policies
DROP POLICY IF EXISTS "Allow anon insert on admissions" ON admissions_applications;
DROP POLICY IF EXISTS "Allow auth read on admissions" ON admissions_applications;
DROP POLICY IF EXISTS "Allow auth update on admissions" ON admissions_applications;

-- 1. Anyone (public website) can insert
CREATE POLICY "Allow anon insert on admissions" 
ON admissions_applications FOR INSERT 
WITH CHECK (true);

-- 2. Authenticated users (Admins) can read everything
CREATE POLICY "Allow auth read on admissions" 
ON admissions_applications FOR SELECT 
TO authenticated 
USING (true);

-- 3. Authenticated users (Admins) can update everything
CREATE POLICY "Allow auth update on admissions" 
ON admissions_applications FOR UPDATE 
TO authenticated 
USING (true);

-- 4. Authenticated users (Admins) can delete everything
CREATE POLICY "Allow auth delete on admissions" 
ON admissions_applications FOR DELETE 
TO authenticated 
USING (true);

NOTIFY pgrst, 'reload schema';
