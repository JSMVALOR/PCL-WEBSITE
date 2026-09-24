```sql
-- 1. Add missing updated_at column to assignments (for the Edit Assignment feature)
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- 2. Add missing updated_at column to marks_ledger (for the Admin Manual Override feature)
ALTER TABLE public.marks_ledger ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- 3. Create the mark_correction_requests table (for the Internal Marks Change Request workflow)
CREATE TABLE IF NOT EXISTS public.mark_correction_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    faculty_id uuid REFERENCES public.profiles(id),
    student_id uuid REFERENCES public.profiles(id),
    subject_id uuid REFERENCES public.master_subjects(id),
    assessment_type text,
    old_mark numeric,
    requested_mark numeric,
    reason text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mark_correction_requests_pkey PRIMARY KEY (id)
);
```
