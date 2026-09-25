CREATE TABLE IF NOT EXISTS public.admissions_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    program text NOT NULL,
    family_in_legal text,
    family_in_legal_who text,
    marks_10th text,
    marks_inter text,
    exam_tglawcet text,
    exam_clat text,
    exam_other text,
    status text DEFAULT 'pending',
    source text DEFAULT 'website',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admissions_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (since they are applying from public website)
DROP POLICY IF EXISTS "Allow anonymous insert for admissions" ON public.admissions_applications;
CREATE POLICY "Allow anonymous insert for admissions" ON public.admissions_applications
    FOR INSERT WITH CHECK (true);

-- Also ensure helpdesk_tickets allows anonymous insert for admissions
DROP POLICY IF EXISTS "Allow anon insert for tickets" ON public.helpdesk_tickets;
CREATE POLICY "Allow anon insert for tickets" ON public.helpdesk_tickets
    FOR INSERT WITH CHECK (true);
