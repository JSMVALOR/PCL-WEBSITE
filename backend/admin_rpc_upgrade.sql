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
