const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const sql = `
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Manually delete from dependent tables to avoid foreign key violations
  DELETE FROM public.mentorship WHERE student_id = target_user_id OR mentor_id = target_user_id;
  DELETE FROM public.mentorship_meetings WHERE mentee_id = target_user_id OR mentor_id = target_user_id;
  DELETE FROM public.faculty_profiles WHERE id = target_user_id;
  DELETE FROM public.attendance_records WHERE student_id = target_user_id;
  DELETE FROM public.leave_requests WHERE student_id = target_user_id OR faculty_id = target_user_id;
  DELETE FROM public.faculty_leaves WHERE faculty_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete from auth system
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
  `;
  
  const { data, error } = await supabase.rpc('admin_exec_sql', { query_text: sql });
  if (error) {
    console.error("Failed", error);
  } else {
    console.log("Success", data);
  }
}
run();
