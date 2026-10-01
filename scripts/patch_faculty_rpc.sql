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
