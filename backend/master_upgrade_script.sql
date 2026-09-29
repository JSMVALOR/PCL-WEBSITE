-- ==========================================
-- 1. SCHEMA UPDATES
-- ==========================================
ALTER TABLE academic_batches ADD COLUMN IF NOT EXISTS campus_start_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section character varying;

-- ==========================================
-- 2. ADMIN USER CREATION RPC (Email Bypass)
-- ==========================================
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
      VALUES (new_user_id, 'Assistant Professor', 'New faculty member profile.', now(), now());
    END IF;
  END IF;

  RETURN new_user_id;
END;
$$;

-- ==========================================
-- 3. STORAGE BUCKETS & POLICIES (Avatars)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatars Upload" ON storage.objects;
CREATE POLICY "Avatars Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars Update" ON storage.objects;
CREATE POLICY "Avatars Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatars Select" ON storage.objects;
CREATE POLICY "Avatars Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- ==========================================
-- 4. FACULTY PROFILES RLS
-- ==========================================
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all faculty profiles" ON public.faculty_profiles;
CREATE POLICY "Admins can manage all faculty profiles" ON public.faculty_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

-- ==========================================
-- 5. EXACT TIMETABLE GENERATION & FIXES
-- ==========================================
-- Read the generated timetables.sql for the 163 rows of exact schedule data!
-- EXACT TIMETABLE GENERATION

DELETE FROM public.class_schedule;
DELETE FROM public.cohort_subjects;

INSERT INTO public.class_schedule (batch, subject_id, faculty_id, day_of_week, start_time, end_time, status) VALUES
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 1, '09:00:00', '09:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '09:50:00', '10:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '76dd7c36-8bbe-418b-868d-2676d55ee3d0', '956820ab-a1fd-46c1-924f-d122836c3378', 1, '10:50:00', '11:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'fdbe62cd-9c66-43b2-b994-5eb1118554a1', 'e213c688-8b7c-4c03-b802-8c07ace21626', 1, '11:40:00', '12:25:00', 'Scheduled'),
('BA LLB (Class of 2031)', '26b798f2-7247-4445-95a1-02ca3ab0a868', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 1, '12:25:00', '13:20:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 1, '14:00:00', '14:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '14:50:00', '15:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 2, '09:00:00', '09:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '09:50:00', '10:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '76dd7c36-8bbe-418b-868d-2676d55ee3d0', '956820ab-a1fd-46c1-924f-d122836c3378', 2, '10:50:00', '11:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'fdbe62cd-9c66-43b2-b994-5eb1118554a1', 'e213c688-8b7c-4c03-b802-8c07ace21626', 2, '11:40:00', '12:25:00', 'Scheduled'),
('BA LLB (Class of 2031)', '26b798f2-7247-4445-95a1-02ca3ab0a868', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 2, '12:25:00', '13:20:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 2, '14:00:00', '14:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '14:50:00', '15:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 3, '09:00:00', '09:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '09:50:00', '10:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '76dd7c36-8bbe-418b-868d-2676d55ee3d0', '956820ab-a1fd-46c1-924f-d122836c3378', 3, '10:50:00', '11:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'fdbe62cd-9c66-43b2-b994-5eb1118554a1', 'e213c688-8b7c-4c03-b802-8c07ace21626', 3, '11:40:00', '12:25:00', 'Scheduled'),
('BA LLB (Class of 2031)', '26b798f2-7247-4445-95a1-02ca3ab0a868', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 3, '12:25:00', '13:20:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 3, '14:00:00', '14:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '14:50:00', '15:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 4, '09:00:00', '09:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '09:50:00', '10:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '76dd7c36-8bbe-418b-868d-2676d55ee3d0', '956820ab-a1fd-46c1-924f-d122836c3378', 4, '10:50:00', '11:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'fdbe62cd-9c66-43b2-b994-5eb1118554a1', 'e213c688-8b7c-4c03-b802-8c07ace21626', 4, '11:40:00', '12:25:00', 'Scheduled'),
('BA LLB (Class of 2031)', '26b798f2-7247-4445-95a1-02ca3ab0a868', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 4, '12:25:00', '13:20:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 4, '14:00:00', '14:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '14:50:00', '15:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 5, '09:00:00', '09:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '09:50:00', '10:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', '76dd7c36-8bbe-418b-868d-2676d55ee3d0', '956820ab-a1fd-46c1-924f-d122836c3378', 5, '10:50:00', '11:35:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'fdbe62cd-9c66-43b2-b994-5eb1118554a1', 'e213c688-8b7c-4c03-b802-8c07ace21626', 5, '11:40:00', '12:25:00', 'Scheduled'),
('BA LLB (Class of 2031)', '26b798f2-7247-4445-95a1-02ca3ab0a868', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 5, '12:25:00', '13:20:00', 'Scheduled'),
('BA LLB (Class of 2031)', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 5, '14:00:00', '14:45:00', 'Scheduled'),
('BA LLB (Class of 2031)', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '14:50:00', '15:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 1, '09:00:00', '09:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 1, '09:50:00', '10:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '79aec943-98a3-4f31-b94d-c807618c87f9', 'e213c688-8b7c-4c03-b802-8c07ace21626', 1, '10:50:00', '11:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '593b74ba-c5af-4a4d-adf9-b3628fc8c538', 'e213c688-8b7c-4c03-b802-8c07ace21626', 1, '11:40:00', '12:25:00', 'Scheduled'),
('BBA LLB (Class of 2031)', 'fa25a862-0ab2-4dcf-baa7-33e79c477727', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 1, '12:25:00', '13:20:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 1, '14:00:00', '14:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 1, '14:50:00', '15:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 2, '09:00:00', '09:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 2, '09:50:00', '10:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '79aec943-98a3-4f31-b94d-c807618c87f9', 'e213c688-8b7c-4c03-b802-8c07ace21626', 2, '10:50:00', '11:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '593b74ba-c5af-4a4d-adf9-b3628fc8c538', 'e213c688-8b7c-4c03-b802-8c07ace21626', 2, '11:40:00', '12:25:00', 'Scheduled'),
('BBA LLB (Class of 2031)', 'fa25a862-0ab2-4dcf-baa7-33e79c477727', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 2, '12:25:00', '13:20:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 2, '14:00:00', '14:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 2, '14:50:00', '15:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 3, '09:00:00', '09:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 3, '09:50:00', '10:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '79aec943-98a3-4f31-b94d-c807618c87f9', 'e213c688-8b7c-4c03-b802-8c07ace21626', 3, '10:50:00', '11:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '593b74ba-c5af-4a4d-adf9-b3628fc8c538', 'e213c688-8b7c-4c03-b802-8c07ace21626', 3, '11:40:00', '12:25:00', 'Scheduled'),
('BBA LLB (Class of 2031)', 'fa25a862-0ab2-4dcf-baa7-33e79c477727', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 3, '12:25:00', '13:20:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 3, '14:00:00', '14:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 3, '14:50:00', '15:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 4, '09:00:00', '09:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 4, '09:50:00', '10:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '79aec943-98a3-4f31-b94d-c807618c87f9', 'e213c688-8b7c-4c03-b802-8c07ace21626', 4, '10:50:00', '11:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '593b74ba-c5af-4a4d-adf9-b3628fc8c538', 'e213c688-8b7c-4c03-b802-8c07ace21626', 4, '11:40:00', '12:25:00', 'Scheduled'),
('BBA LLB (Class of 2031)', 'fa25a862-0ab2-4dcf-baa7-33e79c477727', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 4, '12:25:00', '13:20:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 4, '14:00:00', '14:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 4, '14:50:00', '15:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 5, '09:00:00', '09:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 5, '09:50:00', '10:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '79aec943-98a3-4f31-b94d-c807618c87f9', 'e213c688-8b7c-4c03-b802-8c07ace21626', 5, '10:50:00', '11:35:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '593b74ba-c5af-4a4d-adf9-b3628fc8c538', 'e213c688-8b7c-4c03-b802-8c07ace21626', 5, '11:40:00', '12:25:00', 'Scheduled'),
('BBA LLB (Class of 2031)', 'fa25a862-0ab2-4dcf-baa7-33e79c477727', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 5, '12:25:00', '13:20:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f', 5, '14:00:00', '14:45:00', 'Scheduled'),
('BBA LLB (Class of 2031)', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c', 5, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 1, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 1, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 1, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 2, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 2, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 2, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 3, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 3, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 3, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 4, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 4, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 4, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 5, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 5, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 5, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section I', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 1, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 1, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 1, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 1, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 2, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 2, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 2, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 2, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 3, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 3, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 3, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 3, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 4, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 4, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 4, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 4, '14:50:00', '15:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '09:00:00', '09:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '09:50:00', '10:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378', 5, '10:50:00', '11:35:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378', 5, '11:40:00', '12:25:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf', 5, '12:25:00', '13:20:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '14:00:00', '14:45:00', 'Scheduled'),
('LLB (Class of 2029) - Section II', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f', 5, '14:50:00', '15:35:00', 'Scheduled');

INSERT INTO public.cohort_subjects (batch_id, master_subject_id, faculty_id) VALUES
('17eea294-112e-477e-b9d5-33870698908d', '4d0aaefa-3291-4f83-8259-10f8419e2fc4', 'db666fb4-a532-47dc-a42d-2098b0f19c8f'),
('17eea294-112e-477e-b9d5-33870698908d', 'd4c795a7-5b4a-4324-a9ef-e3e3ee46cfee', '86119926-d9b9-4b9b-ab74-20629a6eb30f'),
('17eea294-112e-477e-b9d5-33870698908d', '76dd7c36-8bbe-418b-868d-2676d55ee3d0', '956820ab-a1fd-46c1-924f-d122836c3378'),
('17eea294-112e-477e-b9d5-33870698908d', 'fdbe62cd-9c66-43b2-b994-5eb1118554a1', 'e213c688-8b7c-4c03-b802-8c07ace21626'),
('17eea294-112e-477e-b9d5-33870698908d', '26b798f2-7247-4445-95a1-02ca3ab0a868', '37c647d3-aa1e-43db-a1e0-a528c29476cf'),
('9b6bcbc3-4448-497e-8f92-1b0512452a1d', '4e6f05f1-58b5-4e9d-9133-d4a08933eb0c', 'db666fb4-a532-47dc-a42d-2098b0f19c8f'),
('9b6bcbc3-4448-497e-8f92-1b0512452a1d', '1db3f3db-7a45-4f0a-a7ac-e297a92c2dd4', 'fd0fc932-d6d5-4349-aeb1-d8af07a51f8c'),
('9b6bcbc3-4448-497e-8f92-1b0512452a1d', '79aec943-98a3-4f31-b94d-c807618c87f9', 'e213c688-8b7c-4c03-b802-8c07ace21626'),
('9b6bcbc3-4448-497e-8f92-1b0512452a1d', '593b74ba-c5af-4a4d-adf9-b3628fc8c538', 'e213c688-8b7c-4c03-b802-8c07ace21626'),
('9b6bcbc3-4448-497e-8f92-1b0512452a1d', 'fa25a862-0ab2-4dcf-baa7-33e79c477727', '37c647d3-aa1e-43db-a1e0-a528c29476cf'),
('f7f03519-a87e-44c0-829a-354bd8aeffd8', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f'),
('f7f03519-a87e-44c0-829a-354bd8aeffd8', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f'),
('f7f03519-a87e-44c0-829a-354bd8aeffd8', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378'),
('f7f03519-a87e-44c0-829a-354bd8aeffd8', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378'),
('f7f03519-a87e-44c0-829a-354bd8aeffd8', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf'),
('66af04d7-b485-41e3-bbbe-1ad04a2448d1', 'f670f084-ba6e-4524-b068-ffd7b1a87ee9', '86119926-d9b9-4b9b-ab74-20629a6eb30f'),
('66af04d7-b485-41e3-bbbe-1ad04a2448d1', 'd51e4413-d799-4a29-a8cd-6e8f60b5556f', '86119926-d9b9-4b9b-ab74-20629a6eb30f'),
('66af04d7-b485-41e3-bbbe-1ad04a2448d1', '9c822743-fb52-4463-b951-7cdd58c00f88', '956820ab-a1fd-46c1-924f-d122836c3378'),
('66af04d7-b485-41e3-bbbe-1ad04a2448d1', '6b51900f-6ce1-4377-8653-1beb6c49b6e5', '956820ab-a1fd-46c1-924f-d122836c3378'),
('66af04d7-b485-41e3-bbbe-1ad04a2448d1', '97ddfc8f-2090-4935-ae3e-e9bf37215382', '37c647d3-aa1e-43db-a1e0-a528c29476cf');

-- =======================================================
-- ADD PROF. PAVITHRA TO SYSTEM (AUTH, PROFILE, FACULTY)
-- =======================================================

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user) VALUES
('db666fb4-a532-47dc-a42d-2098b0f19c8f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pavithra@prudentia.edu', extensions.crypt('Password123!', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Ms. V. Pavithra","role":"faculty"}', false, false) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, erp_id, full_name, email, role, department, status, profile_picture_url) VALUES
('db666fb4-a532-47dc-a42d-2098b0f19c8f', 'FAC-0008', 'Ms. V. Pavithra', 'pavithra@prudentia.edu', 'faculty', 'English', 'active', '/assets/people/ms_v_pavithra.jpg') ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faculty_profiles (id, designation, image_url, is_public, bio, education, research, experience) VALUES
('db666fb4-a532-47dc-a42d-2098b0f19c8f', 'Lecturer', '/assets/people/ms_v_pavithra.jpg', true, 'Ms. V. Pavithra is a lecturer at Prudentia College of Law...', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) ON CONFLICT (id) DO NOTHING;

