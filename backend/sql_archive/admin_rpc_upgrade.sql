-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- RPC for resetting user passwords securely from the admin panel
CREATE OR REPLACE FUNCTION public.admin_reset_password(
  target_user_id UUID,
  new_password TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_user_id;
END;
$$;

-- RPC for completely removing a user identity securely
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Manually delete from dependent tables to avoid foreign key violations
  DELETE FROM public.faculty_profiles WHERE id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete from auth system
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- RPC for updating a profile's status (e.g. Active vs Restricted)
CREATE OR REPLACE FUNCTION public.admin_update_profile_status(
  target_user_id UUID,
  new_status TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET status = new_status
  WHERE id = target_user_id;
END;
$$;

-- RPC for completely updating a user's master profile record (bypassing RLS)
CREATE OR REPLACE FUNCTION public.admin_update_master_record(
  target_user_id UUID,
  payload JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profiles table
  UPDATE public.profiles
  SET 
    full_name = COALESCE(payload->>'full_name', full_name),
    erp_id = COALESCE(payload->>'erp_id', erp_id),
    email = COALESCE(payload->>'email', email),
    phone = COALESCE(payload->>'phone', phone),
    blood_group = COALESCE(payload->>'blood_group', blood_group),
    profile_picture_url = COALESCE(payload->>'profile_picture_url', profile_picture_url),
    academic_batch = COALESCE(payload->>'academic_batch', academic_batch),
    section = COALESCE(payload->>'section', section),
    department = COALESCE(payload->>'department', department),
    dob = COALESCE((payload->>'dob')::date, dob),
    questionnaire_data = COALESCE(payload->'questionnaire_data', questionnaire_data)
  WHERE id = target_user_id;
END;
$$;

-- RPC for updating faculty website display profile (bypassing RLS)
CREATE OR REPLACE FUNCTION public.admin_update_faculty_record(
  target_user_id UUID,
  payload JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.faculty_profiles (id, designation, specialisation, image_url, bio, research, is_public, phone)
  VALUES (
    target_user_id,
    payload->>'designation',
    payload->>'specialisation',
    payload->>'image_url',
    payload->>'bio',
    ARRAY(SELECT jsonb_array_elements_text(payload->'research')),
    (payload->>'is_public')::boolean,
    payload->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    designation = EXCLUDED.designation,
    specialisation = EXCLUDED.specialisation,
    image_url = EXCLUDED.image_url,
    bio = EXCLUDED.bio,
    research = EXCLUDED.research,
    is_public = EXCLUDED.is_public,
    phone = EXCLUDED.phone;
END;
$$;
CREATE OR REPLACE FUNCTION public.admin_update_faculty_record(
  target_user_id UUID,
  payload JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.faculty_profiles (id, designation, specialisation, image_url, bio, research, is_public, phone)
  VALUES (
    target_user_id,
    payload->>'designation',
    payload->>'specialisation',
    payload->>'image_url',
    payload->>'bio',
    payload->'research',
    (payload->>'is_public')::boolean,
    payload->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    designation = EXCLUDED.designation,
    specialisation = EXCLUDED.specialisation,
    image_url = EXCLUDED.image_url,
    bio = EXCLUDED.bio,
    research = EXCLUDED.research,
    is_public = EXCLUDED.is_public,
    phone = EXCLUDED.phone;
END;
$$;
