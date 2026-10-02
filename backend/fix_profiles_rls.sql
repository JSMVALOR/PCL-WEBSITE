-- Fix RLS Policies for Profiles (Allow Admins to insert/update)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (like Admins) to insert into profiles
CREATE POLICY "Allow auth insert on profiles" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update profiles
CREATE POLICY "Allow auth update on profiles" 
ON profiles FOR UPDATE 
TO authenticated 
USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
