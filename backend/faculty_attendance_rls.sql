-- Ensure faculty_daily_presence has correct RLS policies
 ALTER TABLE faculty_daily_presence ENABLE ROW LEVEL SECURITY;
 
 -- Allow users to insert/update their own attendance records
 CREATE POLICY "Allow faculty to insert own attendance" 
 ON faculty_daily_presence FOR INSERT 
 WITH CHECK (auth.uid() = faculty_id);
 
 CREATE POLICY "Allow faculty to update own attendance" 
 ON faculty_daily_presence FOR UPDATE 
 USING (auth.uid() = faculty_id);
 
 CREATE POLICY "Allow faculty to select own attendance" 
 ON faculty_daily_presence FOR SELECT 
 USING (auth.uid() = faculty_id);
 
 -- Allow admins to see and modify everything
 CREATE POLICY "Allow admins to select all attendance" 
 ON faculty_daily_presence FOR SELECT 
 USING (
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() 
     AND profiles.role = 'admin'
   )
 );
 
 CREATE POLICY "Allow admins to insert all attendance" 
 ON faculty_daily_presence FOR INSERT 
 WITH CHECK (
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() 
     AND profiles.role = 'admin'
   )
 );
 
 CREATE POLICY "Allow admins to update all attendance" 
 ON faculty_daily_presence FOR UPDATE 
 USING (
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() 
     AND profiles.role = 'admin'
   )
 );
