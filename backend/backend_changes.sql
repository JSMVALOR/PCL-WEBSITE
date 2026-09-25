-- ==============================================================
-- PCL ERP - CONSOLIDATED MASTER SQL MIGRATION
-- Run this script in your Supabase SQL Editor
-- ==============================================================

-- --------------------------------------------------------------
-- 1. NOTICES & BROADCASTS
-- --------------------------------------------------------------
-- Add external_link column for the Broadcast "Publish to Website" feature
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS external_link text;
ALTER TABLE public.admin_notices ADD COLUMN IF NOT EXISTS external_link text;

-- --------------------------------------------------------------
-- 2. ACADEMIC CALENDAR & EVENTS
-- --------------------------------------------------------------
-- Initialize the dynamic Academic Calendar Grid inside system_settings
INSERT INTO public.system_settings (key, value)
VALUES (
    'academic_calendar_grid',
    '{"columns": ["Date", "Day", "Event"], "rows": []}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Ensure Admins can schedule events
CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."admin_events" 
FOR INSERT TO authenticated WITH CHECK (true);

-- --------------------------------------------------------------
-- 3. ACADEMIC GRADING MODULE (MARKS & SUBMISSIONS)
-- --------------------------------------------------------------

-- Table: Marks Submissions (Handles the "Locking" state of a roster)
CREATE TABLE IF NOT EXISTS public.marks_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.cohort_subjects(id) ON DELETE CASCADE,
    batch VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.marks_submissions ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

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


-- Table: Mark Correction Requests (For locked roster correction flow)
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


-- Table: Marks Ledger (Actual grades storage)
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


-- Table: Assignment Submissions
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
DROP POLICY IF EXISTS "Enable read access for submissions" ON public.assignment_submissions;
CREATE POLICY "Enable read access for submissions" ON public.assignment_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for students" ON public.assignment_submissions;
CREATE POLICY "Enable insert for students" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "Enable update for faculty and students" ON public.assignment_submissions;
CREATE POLICY "Enable update for faculty and students" ON public.assignment_submissions FOR UPDATE USING (true);
ALTER TABLE public.faculty_payroll ADD COLUMN IF NOT EXISTS lop_waived_days integer DEFAULT 0;
ALTER TABLE public.faculty_payroll ADD COLUMN IF NOT EXISTS lop_waived_amount numeric DEFAULT 0;
ALTER TABLE public.faculty_payroll ADD COLUMN IF NOT EXISTS lop_waiver_reason text;
ALTER TABLE public.faculty_payroll ADD COLUMN IF NOT EXISTS salary_structure jsonb;
ALTER TABLE public.faculty_payroll ADD COLUMN IF NOT EXISTS gross_lop_amount numeric DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS questionnaire_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS questionnaire_data JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Indian';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Ensure users can read their own profile (and others if necessary, or just their own)
DROP POLICY IF EXISTS "Enable read access for all" ON public.profiles;
CREATE POLICY "Enable read access for all" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Fix for Blog Submission from public website (RLS violations)
ALTER TABLE public.admin_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to admin_notices" ON public.admin_notices;
CREATE POLICY "Allow public insert to admin_notices" ON public.admin_notices FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on admin_notices" ON public.admin_notices;
CREATE POLICY "Allow public select on admin_notices" ON public.admin_notices FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert to notices" ON public.notices;
CREATE POLICY "Allow public insert to notices" ON public.notices FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Enable RLS if not already
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (recipient_id = auth.uid() OR user_id = auth.uid());

-- Allow users to update their own notifications (e.g. mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (recipient_id = auth.uid() OR user_id = auth.uid());


-- Mentorship Messages RLS (if missing)
ALTER TABLE public.mentorship_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own received messages" ON public.mentorship_messages;
CREATE POLICY "Users can update own received messages" ON public.mentorship_messages
    FOR UPDATE USING (receiver_id = auth.uid());
