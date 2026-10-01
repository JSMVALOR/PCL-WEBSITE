-- 1. FACULTY DAILY PRESENCE (Web Clock)
CREATE TABLE IF NOT EXISTS public.faculty_daily_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIME,
    clock_out TIME,
    status TEXT, -- 'On Time', 'Late', 'absent', 'present'
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    total_missed_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(faculty_id, date)
);

-- 2. ATTENDANCE AUDIT LOGS (Admin Overrides)
CREATE TABLE IF NOT EXISTS public.attendance_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    action_reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. KPIS & STATS RPCS (Stubbed / Validated for Dashboard)
CREATE OR REPLACE FUNCTION public.get_admin_kpi_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_students INT;
    total_faculty INT;
    active_leaves INT;
    result JSON;
BEGIN
    SELECT count(*) INTO total_students FROM public.profiles WHERE role = 'student';
    SELECT count(*) INTO total_faculty FROM public.profiles WHERE role = 'faculty';
    SELECT count(*) INTO active_leaves FROM public.leave_requests WHERE status = 'pending';
    
    result := json_build_object(
        'students', total_students,
        'faculty', total_faculty,
        'pending_leaves', active_leaves
    );
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    result := json_build_object(
        'active_users', (SELECT count(*) FROM public.profiles WHERE status = 'active'),
        'system_health', '99.9%'
    );
    RETURN result;
END;
$$;

-- 4. ADMIN USER MGMT RPCs
CREATE OR REPLACE FUNCTION public.admin_update_profile_status(target_user_id UUID, new_status TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles SET status = new_status WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This requires Supabase auth.users delete permissions, usually best done via Edge Function, 
    -- but we can delete the profile here (cascade will handle some things).
    DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_system_vitals()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    result := json_build_object(
        'cpu', 42,
        'memory', 65,
        'active_connections', (SELECT count(*) FROM pg_stat_activity),
        'db_size', pg_size_pretty(pg_database_size(current_database()))
    );
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_master_record(target_user_id UUID, payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET 
        full_name = COALESCE((payload->>'full_name')::text, full_name),
        phone = COALESCE((payload->>'phone')::text, phone),
        department = COALESCE((payload->>'department')::text, department),
        batch_id = COALESCE((payload->>'batch_id')::text, batch_id)
    WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_faculty_record(target_user_id UUID, payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.faculty_profiles
    SET 
        designation = COALESCE((payload->>'designation')::text, designation),
        bio = COALESCE((payload->>'bio')::text, bio),
        qualifications = COALESCE((payload->>'qualifications')::text, qualifications),
        is_public = COALESCE((payload->>'is_public')::boolean, is_public)
    WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reassign_faculty_workload(old_faculty_id UUID, new_faculty_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.master_subjects SET primary_faculty_id = new_faculty_id WHERE primary_faculty_id = old_faculty_id;
    UPDATE public.faculty_timetable SET faculty_id = new_faculty_id WHERE faculty_id = old_faculty_id;
    UPDATE public.mentorship SET faculty_id = new_faculty_id WHERE faculty_id = old_faculty_id;
END;
$$;

-- 5. LEAVES MODULE (Faculty and Student)
CREATE TABLE IF NOT EXISTS public.faculty_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'pending',
    replacement_faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. ATTENDANCE & CLASS SESSIONS
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.master_subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'present', 'absent', 'late', 'excused'
    entry_status TEXT,
    marked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(session_id, student_id)
);
CREATE OR REPLACE FUNCTION public.admin_reassign_faculty_workload(old_faculty_id UUID, new_faculty_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Reassign Subjects
    UPDATE public.cohort_subjects SET faculty_id = new_faculty_id WHERE faculty_id = old_faculty_id;
    -- Reassign Timetable Classes
    UPDATE public.class_schedule SET faculty_id = new_faculty_id WHERE faculty_id = old_faculty_id;
    -- Reassign Mentees
    UPDATE public.mentorship SET faculty_id = new_faculty_id WHERE faculty_id = old_faculty_id;
END;
$$;
-- 1. Drop the dangerous arbitrary SQL executor
DROP FUNCTION IF EXISTS public.admin_exec_sql(text);

-- 2. Create a safe specific RPC for the Site Editor analytics
CREATE OR REPLACE FUNCTION public.get_top_website_clicks()
RETURNS TABLE(element_text text, click_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT element_text, count(*) as click_count 
    FROM public.website_clicks 
    GROUP BY element_text 
    ORDER BY click_count DESC 
    LIMIT 5;
$$;
