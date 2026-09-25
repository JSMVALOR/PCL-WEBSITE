```sql
-- Disable RLS on admin_notices to allow public blog submissions
ALTER TABLE public.admin_notices DISABLE ROW LEVEL SECURITY;

-- If RLS must be kept enabled, alternatively add a policy:
-- CREATE POLICY "Allow public insert to admin_notices for blogs" ON public.admin_notices FOR INSERT TO public WITH CHECK (true);
```
