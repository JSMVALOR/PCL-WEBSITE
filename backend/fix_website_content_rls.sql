-- Fix RLS policies for website_content table
-- This allows authenticated admin users to manage content

-- First, check if the table exists and enable RLS
ALTER TABLE IF EXISTS website_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON website_content;
DROP POLICY IF EXISTS "Allow admin insert" ON website_content;
DROP POLICY IF EXISTS "Allow admin update" ON website_content;
DROP POLICY IF EXISTS "Allow admin delete" ON website_content;
DROP POLICY IF EXISTS "Allow authenticated upsert" ON website_content;
DROP POLICY IF EXISTS "Public read website_content" ON website_content;
DROP POLICY IF EXISTS "Admin manage website_content" ON website_content;
DROP POLICY IF EXISTS "Service role full access" ON website_content;

-- 1. Public read access (anyone can view website content)
CREATE POLICY "Public read website_content"
ON website_content
FOR SELECT
TO public
USING (true);

-- 2. Authenticated users with admin role can INSERT
CREATE POLICY "Admin insert website_content"
ON website_content
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- 3. Authenticated users with admin role can UPDATE
CREATE POLICY "Admin update website_content"
ON website_content
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- 4. Authenticated users with admin role can DELETE
CREATE POLICY "Admin delete website_content"
ON website_content
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'superadmin')
  )
);

-- 5. Service role has full access (for backend operations)
CREATE POLICY "Service role full access website_content"
ON website_content
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure the table has the right structure with unique constraint for upsert
-- Check if the unique constraint exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'website_content_page_path_section_id_key'
    ) THEN
        ALTER TABLE website_content 
        ADD CONSTRAINT website_content_page_path_section_id_key 
        UNIQUE (page_path, section_id);
    END IF;
END $$;

-- Verify the structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'website_content' ORDER BY ordinal_position;
