-- RPC to create user without Supabase email confirmation
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email TEXT,
  new_password TEXT,
  new_role TEXT,
  new_erp_id TEXT,
  new_name TEXT,
  new_assignment TEXT
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  new_user_id := gen_random_uuid();
  encrypted_pw := extensions.crypt(new_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id, 'authenticated', 'authenticated', new_email, encrypted_pw, now(),
    now(), now(), '{"provider":"email","providers":["email"]}',
    jsonb_build_object('role', new_role, 'erp_id', new_erp_id, 'name', new_name),
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    new_user_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id::text, new_email)::jsonb, 'email', new_user_id::text, now(), now(), now()
  );

  IF new_role = 'student' THEN
    INSERT INTO public.profiles (id, role, erp_id, full_name, email, status, academic_batch)
    VALUES (new_user_id, new_role, new_erp_id, new_name, new_email, 'Active', new_assignment);
  ELSE
    INSERT INTO public.profiles (id, role, erp_id, full_name, email, status, department)
    VALUES (new_user_id, new_role, new_erp_id, new_name, new_email, 'Active', new_assignment);
    
    IF new_role = 'faculty' THEN
      INSERT INTO public.faculty_profiles (id, designation, bio, created_at, updated_at)
      VALUES (new_user_id, 'Assistant Professor', 'New faculty member profile.', now(), now()) ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  RETURN new_user_id;
END;
$$;
