-- Fix RLS Policies for gallery_images
-- Allows anon users (used by the frontend) to delete and update images.

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- If they don't exist already, these will be created. If they do exist, you can drop them first or use CREATE POLICY IF NOT EXISTS.
-- To be safe, we drop existing anon policies first (if any).
DROP POLICY IF EXISTS "Allow anon delete on gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Allow anon update on gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Allow anon insert on gallery_images" ON gallery_images;

CREATE POLICY "Allow anon delete on gallery_images" ON gallery_images FOR DELETE USING (true);
CREATE POLICY "Allow anon update on gallery_images" ON gallery_images FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert on gallery_images" ON gallery_images FOR INSERT WITH CHECK (true);
