-- ==============================================================
-- PCL ERP - ACADEMICS & GRADING MODULE - SQL MIGRATION
-- Run this in your Supabase SQL Editor to finalize the tables!
-- ==============================================================

-- 1. Marks Submissions (Handles the "Locking" state of a roster)
CREATE TABLE IF NOT EXISTS public.marks_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.cohort_subjects(id) ON DELETE CASCADE,
    batch VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.marks_submissions ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS for marks_submissions
ALTER TABLE public.marks_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read lock status (Faculty and Admin)
CREATE POLICY "Enable read access for marks_submissions" 
ON public.marks_submissions FOR SELECT 
USING (true);

-- Policy: Faculty can insert a lock for their own subjects
CREATE POLICY "Enable insert for faculty locking roster" 
ON public.marks_submissions FOR INSERT 
WITH CHECK (
  auth.uid() = faculty_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'faculty'))
);

-- Policy: Admins can delete locks (Unlock)
CREATE POLICY "Enable delete for admins"
ON public.marks_submissions FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);


-- ==============================================================
-- 2. Mark Correction Requests (For locked roster correction flow)
CREATE TABLE IF NOT EXISTS public.mark_correction_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.cohort_subjects(id) ON DELETE CASCADE,
    batch VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(255) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_marks NUMERIC(5, 2),
    requested_marks NUMERIC(5, 2),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);
ALTER TABLE public.mark_correction_requests ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.mark_correction_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Read access
CREATE POLICY "Enable read access for corrections" 
ON public.mark_correction_requests FOR SELECT 
USING (true);

-- Policy: Faculty can insert correction requests
CREATE POLICY "Enable insert for corrections" 
ON public.mark_correction_requests FOR INSERT 
WITH CHECK (
  auth.uid() = faculty_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
);

-- Policy: Admins can update status
CREATE POLICY "Enable update for admins" 
ON public.mark_correction_requests FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);


-- ==============================================================
-- 3. Marks Ledger (Actual grades)
-- (If it doesn't exist, create it. If it exists, fix the policies)
CREATE TABLE IF NOT EXISTS public.marks_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.cohort_subjects(id) ON DELETE CASCADE,
    assessment_type VARCHAR(255) NOT NULL, -- e.g. 'Midterm', 'Assignment 1'
    marks_obtained NUMERIC(5, 2) NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.marks_ledger ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.marks_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for marks" ON public.marks_ledger FOR SELECT USING (true);

-- Faculty can insert and update grades
CREATE POLICY "Enable insert for faculty" ON public.marks_ledger FOR INSERT 
WITH CHECK (
    auth.uid() = faculty_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'faculty'))
);
CREATE POLICY "Enable update for faculty" ON public.marks_ledger FOR UPDATE 
USING (
    auth.uid() = faculty_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'faculty'))
);


-- ==============================================================
-- 4. Assignment Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    file_url TEXT,
    text_content TEXT,
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, graded
    grade NUMERIC(5, 2),
    feedback TEXT,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for submissions" ON public.assignment_submissions FOR SELECT USING (true);
CREATE POLICY "Enable insert for students" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Enable update for faculty and students" ON public.assignment_submissions FOR UPDATE USING (true);
-- Run this first!
-- This ensures the columns exist before the policies try to use them.
ALTER TABLE public.marks_submissions ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.mark_correction_requests ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.marks_ledger ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
-- Run this AFTER Step 1!

-- 1. Marks Submissions Policies
ALTER TABLE public.marks_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for marks_submissions" ON public.marks_submissions;
CREATE POLICY "Enable read access for marks_submissions" ON public.marks_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for faculty locking roster" ON public.marks_submissions;
CREATE POLICY "Enable insert for faculty locking roster" ON public.marks_submissions FOR INSERT 
WITH CHECK (
  auth.uid() = faculty_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'faculty'))
);

DROP POLICY IF EXISTS "Enable delete for admins" ON public.marks_submissions;
CREATE POLICY "Enable delete for admins" ON public.marks_submissions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);


-- 2. Mark Correction Requests Policies
ALTER TABLE public.mark_correction_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for corrections" ON public.mark_correction_requests;
CREATE POLICY "Enable read access for corrections" ON public.mark_correction_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for corrections" ON public.mark_correction_requests;
CREATE POLICY "Enable insert for corrections" ON public.mark_correction_requests FOR INSERT 
WITH CHECK (
  auth.uid() = faculty_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty'))
);

DROP POLICY IF EXISTS "Enable update for admins" ON public.mark_correction_requests;
CREATE POLICY "Enable update for admins" ON public.mark_correction_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
);


-- 3. Marks Ledger Policies
ALTER TABLE public.marks_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for marks" ON public.marks_ledger;
CREATE POLICY "Enable read access for marks" ON public.marks_ledger FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for faculty" ON public.marks_ledger;
CREATE POLICY "Enable insert for faculty" ON public.marks_ledger FOR INSERT 
WITH CHECK (
    auth.uid() = faculty_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'faculty'))
);

DROP POLICY IF EXISTS "Enable update for faculty" ON public.marks_ledger;
CREATE POLICY "Enable update for faculty" ON public.marks_ledger FOR UPDATE 
USING (
    auth.uid() = faculty_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'faculty'))
);
