-- RPC to reassign faculty workload
CREATE OR REPLACE FUNCTION public.admin_reassign_faculty_workload(
  old_faculty_id UUID,
  new_faculty_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cohorts_updated INT;
  classes_updated INT;
BEGIN
  -- Reassign cohort subjects
  UPDATE public.cohort_subjects
  SET faculty_id = new_faculty_id
  WHERE faculty_id = old_faculty_id;
  GET DIAGNOSTICS cohorts_updated = ROW_COUNT;

  -- Reassign class schedule
  UPDATE public.class_schedule
  SET faculty_id = new_faculty_id
  WHERE faculty_id = old_faculty_id;
  GET DIAGNOSTICS classes_updated = ROW_COUNT;

  RETURN json_build_object(
    'cohorts_updated', cohorts_updated,
    'classes_updated', classes_updated
  )::jsonb;
END;
$$;
