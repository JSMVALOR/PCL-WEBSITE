-- Create Mentorship Table
CREATE TABLE IF NOT EXISTS public.mentorship (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id)
);

-- Enable RLS
ALTER TABLE public.mentorship ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
DROP POLICY IF EXISTS "Enable read access for all" ON public.mentorship;
CREATE POLICY "Enable read access for all" ON public.mentorship FOR SELECT USING (true);

-- Allow admins to insert
DROP POLICY IF EXISTS "Enable insert for admins" ON public.mentorship;
CREATE POLICY "Enable insert for admins" ON public.mentorship FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);

-- Allow admins to delete
DROP POLICY IF EXISTS "Enable delete for admins" ON public.mentorship;
CREATE POLICY "Enable delete for admins" ON public.mentorship FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);
