-- Drop the existing foreign key constraint from profiles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Re-add it with ON DELETE CASCADE
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- If there are other tables referencing auth.users, they might also need this:
-- Example: 
-- ALTER TABLE public.some_other_table DROP CONSTRAINT ...
-- ADD CONSTRAINT ... ON DELETE CASCADE;
