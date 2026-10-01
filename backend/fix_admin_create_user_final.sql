CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email TEXT,
  new_password TEXT,
  new_role TEXT,
  new_name TEXT,
  new_erp_id TEXT,
  new_assignment TEXT DEFAULT NULL,
  student_name TEXT DEFAULT NULL
) RETURNS jsonb AS $func$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
  result jsonb;
BEGIN
  -- Generate user ID
  new_user_id := extensions.uuid_generate_v4();

  -- Encrypt password
  encrypted_pw := extensions.crypt(new_password, extensions.gen_salt('bf', 10));

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    is_sso_user
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    new_email,
    encrypted_pw,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', new_name, 'role', new_role),
    false,
    false
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    extensions.uuid_generate_v4(),
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, new_email)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- Return success
  result := jsonb_build_object(
    'id', new_user_id,
    'email', new_email,
    'role', new_role,
    'erp_id', new_erp_id,
    'temp_password', new_password
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
