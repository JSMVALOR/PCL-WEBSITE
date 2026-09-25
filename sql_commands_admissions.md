```sql
-- Disable RLS on admissions_applications to allow public application submissions
ALTER TABLE public.admissions_applications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on helpdesk_tickets to allow public ticket creation (if not already disabled)
ALTER TABLE public.helpdesk_tickets DISABLE ROW LEVEL SECURITY;
```
