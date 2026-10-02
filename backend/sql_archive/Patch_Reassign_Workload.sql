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
