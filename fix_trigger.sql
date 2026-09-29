CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, erp_id, full_name, email, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'erp_id',
    new.raw_user_meta_data->>'name',
    new.email,
    'Active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
