CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up any existing seed users first (so you can safely re-run this script anytime)
DELETE FROM auth.users WHERE email IN ('adm0001_v2@jsm.edu', 'fac0001_v2@jsm.edu', '26bbl7020_v2@jsm.edu');

-- =================================================================================
-- ADMIN ACCOUNT (ERP ID: ADM0001)
-- =================================================================================
WITH new_admin AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'adm0001_v2@jsm.edu', 
    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', 
    '{"role": "admin"}', now(), now(), '', '', '', ''
  ) RETURNING id
)
INSERT INTO public.profiles (id, erp_id, full_name, email, role, status)
SELECT id, 'ADM0001', 'System Administrator', 'adm0001_v2@jsm.edu', 'admin', 'Active' FROM new_admin;


-- =================================================================================
-- FACULTY ACCOUNT (ERP ID: FAC0001 - Dr. Sneha Mulla)
-- =================================================================================
WITH new_faculty AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'fac0001_v2@jsm.edu', 
    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', 
    '{"role": "faculty"}', now(), now(), '', '', '', ''
  ) RETURNING id
)
INSERT INTO public.profiles (id, erp_id, full_name, email, role, department, status)
SELECT id, 'FAC0001', 'Dr. Sneha Mulla', 'fac0001_v2@jsm.edu', 'faculty', 'Law', 'Active' FROM new_faculty;

-- Link faculty_profiles
INSERT INTO public.faculty_profiles (id, designation, is_public)
SELECT id, 'Founder & Professor', true FROM public.profiles WHERE email = 'fac0001_v2@jsm.edu';


-- =================================================================================
-- STUDENT ACCOUNT (ERP ID: 26BBL7020)
-- =================================================================================
WITH new_student AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', '26bbl7020_v2@jsm.edu', 
    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider": "email", "providers": ["email"]}', 
    '{"role": "student"}', now(), now(), '', '', '', ''
  ) RETURNING id
)
INSERT INTO public.profiles (id, erp_id, full_name, email, role, academic_batch, programme, status)
SELECT id, '26BBL7020', 'John Doe Student', '26bbl7020_v2@jsm.edu', 'student', '2024-2029', 'BA LLB', 'Active' FROM new_student;
