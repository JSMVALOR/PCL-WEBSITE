CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================-- 1. Users & Core Profiles============================================================
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  erp_id character varying NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['student'::character varying, 'faculty'::character varying, 'admin'::character varying]::text[])),
  academic_batch character varying,
  cgpa numeric DEFAULT 0.00,
  total_credits_earned integer DEFAULT 0,
  phone character varying,
  department character varying,
  profile_picture_url text,
  webauthn_credential_id text,
  webauthn_public_key text,
  questionnaire_completed boolean DEFAULT false,
  questionnaire_data jsonb DEFAULT '{}'::jsonb,
  status character varying DEFAULT 'Active'::character varying,
  dob date,
  blood_group character varying,
  semester integer,
  nationality text DEFAULT 'Indian'::text,
  gender text,
  programme text,
  section text,
  batch text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  device_name text,
  browser text,
  os text,
  ip_address text,
  created_at timestamp with time zone DEFAULT now(),
  last_active_at timestamp with time zone DEFAULT now(),
  is_revoked boolean DEFAULT false,
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faculty_profiles (
  id uuid NOT NULL,
  designation character varying,
  specialisation text,
  degrees character varying,
  office_address character varying,
  phone character varying,
  linkedin_url text,
  scholar_url text,
  image_url text,
  education jsonb DEFAULT '[]'::jsonb,
  research jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  patents jsonb DEFAULT '[]'::jsonb,
  awards jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  bio text,
  CONSTRAINT faculty_profiles_pkey PRIMARY KEY (id)
);


-- ============================================================-- 2. Academic Structure============================================================
CREATE TABLE public.academic_years (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_locked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_years_pkey PRIMARY KEY (id)
);
CREATE TABLE public.academic_semesters (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  academic_year_id uuid,
  name text NOT NULL,
  programme text NOT NULL,
  status text NOT NULL DEFAULT 'Draft'::text,
  is_active_globally boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  start_date date,
  end_date date,
  CONSTRAINT academic_semesters_pkey PRIMARY KEY (id)
);
CREATE TABLE public.academic_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  program text NOT NULL,
  start_year integer NOT NULL,
  graduation_year integer NOT NULL,
  whatsapp_group_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_batches_pkey PRIMARY KEY (id)
);
CREATE TABLE public.academic_classrooms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  building text,
  capacity integer NOT NULL,
  is_smart_board boolean DEFAULT false,
  has_ac boolean DEFAULT false,
  is_moot_court boolean DEFAULT false,
  status text DEFAULT 'Active'::text,
  created_at timestamp with time zone DEFAULT now(),
  type text DEFAULT 'Lecture Hall'::text,
  CONSTRAINT academic_classrooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.institution_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  programme text NOT NULL DEFAULT 'GLOBAL'::text UNIQUE,
  start_time time without time zone NOT NULL DEFAULT '09:00:00'::time without time zone,
  end_time time without time zone NOT NULL DEFAULT '16:00:00'::time without time zone,
  off_days jsonb NOT NULL DEFAULT '["Saturday", "Sunday"]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT institution_schedule_pkey PRIMARY KEY (id)
);
CREATE TABLE public.academic_calendar (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  event_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_calendar_pkey PRIMARY KEY (id)
);


-- ============================================================-- 3. Subjects & Course Content============================================================
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  credits integer NOT NULL DEFAULT 4,
  theme_color text NOT NULL,
  semester_id uuid,
  faculty_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  batches text[] DEFAULT '{}'::text[],
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subject_modules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject_id uuid,
  module_number integer NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Not Started'::text,
  completion_percentage integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subject_modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.course_modules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject_id uuid,
  title character varying NOT NULL,
  base_content text NOT NULL,
  faculty_edited_content text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.course_materials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  subject_name character varying,
  subject_id uuid,
  faculty_id uuid,
  batch_id character varying NOT NULL,
  material_type character varying DEFAULT 'Syllabus'::character varying,
  module_week character varying,
  content_text text NOT NULL,
  visibility character varying DEFAULT 'Published'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  is_published boolean DEFAULT true,
  CONSTRAINT course_materials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.course_resources (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  faculty_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'Link'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_resources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  course_id uuid,
  status text DEFAULT 'enrolled'::text,
  enrolled_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faculty_courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  faculty_id uuid,
  course_name character varying,
  course_code character varying,
  total_classes integer DEFAULT 0,
  active boolean DEFAULT true,
  CONSTRAINT faculty_courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faculty_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  faculty_id uuid,
  batch_id character varying NOT NULL,
  subject_name character varying NOT NULL,
  section_name character varying DEFAULT 'Section A'::character varying,
  assigned_on timestamp with time zone DEFAULT now(),
  CONSTRAINT faculty_assignments_pkey PRIMARY KEY (id)
);


-- ============================================================-- 4. Timetable & Scheduling============================================================
CREATE TABLE public.class_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch text NOT NULL,
  subject_id uuid,
  room_id uuid,
  faculty_id uuid,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  status text DEFAULT 'Scheduled'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_schedule_pkey PRIMARY KEY (id)
);
CREATE TABLE public.class_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  schedule_id uuid NOT NULL,
  faculty_id uuid NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'::text,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  qr_token text,
  qr_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.class_substitutions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  leave_id uuid,
  original_faculty_id uuid,
  substitute_faculty_id uuid,
  class_id uuid,
  substitution_date date NOT NULL,
  status character varying DEFAULT 'assigned'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_substitutions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.timetable_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  faculty_id uuid,
  subject_id uuid,
  schedule_id uuid,
  request_type text NOT NULL,
  requested_date date,
  requested_start_time time without time zone,
  requested_end_time time without time zone,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Pending'::text,
  conflict_check_status jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timetable_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.timetable_changes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  schedule_id uuid,
  subject_id uuid,
  request_id uuid,
  change_type text NOT NULL,
  new_date date,
  new_start_time time without time zone,
  new_end_time time without time zone,
  new_room_id uuid,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timetable_changes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.timetable_reschedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  timetable_id uuid,
  faculty_id uuid,
  new_day_of_week text NOT NULL,
  new_start_time text NOT NULL,
  new_end_time text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timetable_reschedules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.roster_unlocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid,
  subject_id uuid,
  batch_ids uuid[] DEFAULT '{}'::uuid[],
  date date NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roster_unlocks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faculty_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL,
  day_of_week text NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  meeting_type text DEFAULT 'In-Person'::text,
  room_link text,
  max_students integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faculty_availability_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  room_number character varying NOT NULL UNIQUE,
  capacity integer DEFAULT 60,
  room_type character varying DEFAULT 'Lecture Hall'::character varying,
  building character varying DEFAULT 'Main Block'::character varying,
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);


-- ============================================================-- 5. Attendance & Student Metrics============================================================
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  course_id character varying,
  date date DEFAULT CURRENT_DATE,
  status character varying CHECK (status::text = ANY (ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'excused'::character varying]::text[])),
  recorded_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT attendance_pkey PRIMARY KEY (id)
);
CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'absent'::text,
  marked_by text NOT NULL DEFAULT 'faculty'::text,
  marked_at timestamp with time zone DEFAULT now(),
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attendance_records_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_metrics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid UNIQUE,
  attendance_percentage numeric DEFAULT 0,
  assignments_pending integer DEFAULT 0,
  assignments_submitted integer DEFAULT 0,
  library_issued integer DEFAULT 0,
  library_due integer DEFAULT 0,
  library_fine numeric DEFAULT 0,
  credits_earned integer DEFAULT 0,
  credits_remaining integer DEFAULT 0,
  internals_score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_metrics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.academic_records (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  semester integer NOT NULL,
  sgpa numeric,
  cgpa numeric,
  term_code character varying,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT academic_records_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_academic_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  semester_name character varying NOT NULL,
  subject_id uuid,
  grade character varying NOT NULL,
  cgpa_for_semester numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_academic_history_pkey PRIMARY KEY (id)
);


-- ============================================================-- 6. Exams & Grading============================================================
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid,
  exam_type character varying NOT NULL,
  exam_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  room_id uuid,
  admit_cards_generated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  total_marks integer DEFAULT 100,
  CONSTRAINT exams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_rooms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  room_name character varying NOT NULL UNIQUE,
  total_rows integer NOT NULL,
  seats_per_row integer NOT NULL,
  total_capacity integer GENERATED ALWAYS AS (total_rows * seats_per_row) STORED,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_rooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_eligibility (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  exam_id uuid,
  attendance_percentage numeric,
  status character varying DEFAULT 'eligible'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_eligibility_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  examination_id uuid,
  student_id uuid,
  marks_obtained numeric NOT NULL,
  grade text,
  status text DEFAULT 'published'::text,
  CONSTRAINT exam_results_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admit_cards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid,
  student_id uuid,
  seat_number character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admit_cards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  faculty_id uuid,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone NOT NULL,
  total_marks integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  student_id uuid,
  file_url text,
  submitted_at timestamp with time zone DEFAULT now(),
  marks_awarded numeric,
  faculty_feedback text,
  submission_text text,
  status character varying DEFAULT 'Pending Review'::character varying,
  grade character varying,
  remarks text,
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.marks_ledger (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  faculty_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  student_id uuid NOT NULL,
  assignment_id uuid,
  assessment_type text NOT NULL,
  marks_obtained numeric NOT NULL DEFAULT 0,
  total_marks integer NOT NULL,
  comments text,
  graded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT marks_ledger_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_marks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  student_name character varying,
  student_erp character varying,
  subject_name character varying,
  exam_type character varying,
  marks_obtained numeric,
  max_marks numeric,
  status character varying DEFAULT 'draft'::character varying,
  faculty_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  admin_locked boolean DEFAULT false,
  CONSTRAINT student_marks_pkey PRIMARY KEY (id)
);


-- ============================================================-- 8. Leaves & Out of Office============================================================
CREATE TABLE public.leave_policies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  annual_limit integer NOT NULL,
  color_theme text DEFAULT 'indigo'::text,
  description text,
  requires_approval boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leave_policies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faculty_leaves (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  request_id character varying UNIQUE,
  user_id uuid,
  role character varying DEFAULT 'student'::character varying,
  leave_type character varying NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  days integer NOT NULL,
  reason text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  approver_name character varying,
  admin_remarks text,
  applied_on timestamp with time zone DEFAULT now(),
  student_id uuid,
  faculty_id uuid,
  classes_affected jsonb DEFAULT '[]'::jsonb,
  replacement_faculty_id uuid,
  replacement_status text DEFAULT 'Pending'::text,
  CONSTRAINT faculty_leaves_pkey PRIMARY KEY (id)
);

CREATE TABLE public.leave_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  request_id character varying UNIQUE,
  user_id uuid,
  role character varying DEFAULT 'student'::character varying,
  leave_type character varying NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  days integer NOT NULL,
  reason text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  approver_name character varying,
  admin_remarks text,
  applied_on timestamp with time zone DEFAULT now(),
  student_id uuid,
  faculty_id uuid,
  classes_affected jsonb DEFAULT '[]'::jsonb,
  replacement_faculty_id uuid,
  replacement_status text DEFAULT 'Pending'::text,
  CONSTRAINT leave_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.leave_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  leave_id uuid,
  action text NOT NULL,
  performed_by text NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leave_audit_logs_pkey PRIMARY KEY (id)
);


-- ============================================================-- 9. Fees & Finance============================================================
CREATE TABLE public.fee_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  semester integer NOT NULL,
  fee_type text NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending'::text,
  paid_on date,
  transaction_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fee_ledger_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fee_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  title text,
  amount numeric,
  due_date date,
  type text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fee_invoices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fee_transactions (
  id text NOT NULL,
  student_id uuid,
  amount numeric,
  status text,
  method text,
  purpose text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fee_transactions_pkey PRIMARY KEY (id)
);


-- ============================================================-- 10. Careers, Placements & Internships============================================================
CREATE TABLE public.placement_drives (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  firm_name character varying NOT NULL,
  role_type character varying NOT NULL,
  eligibility_criteria text,
  application_deadline timestamp with time zone NOT NULL,
  status character varying DEFAULT 'Active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT placement_drives_pkey PRIMARY KEY (id)
);
CREATE TABLE public.placement_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT placement_inquiries_pkey PRIMARY KEY (id)
);
CREATE TABLE public.internships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  organization text NOT NULL,
  role text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'pending_approval'::text,
  report_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT internships_pkey PRIMARY KEY (id)
);
CREATE TABLE public.internship_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  company_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text CHECK (status = ANY (ARRAY['Draft'::text, 'Submitted'::text, 'Under Mentor Review'::text, 'Recommended'::text, 'Approved'::text, 'Rejected'::text])),
  mentor_remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT internship_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_experiences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  company_name character varying NOT NULL,
  role_title character varying NOT NULL,
  location character varying,
  duration character varying,
  description text,
  type character varying DEFAULT 'Corporate'::character varying,
  status character varying DEFAULT 'completed'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_experiences_pkey PRIMARY KEY (id)
);
CREATE TABLE public.noc_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  company_name character varying NOT NULL,
  duration character varying NOT NULL,
  offer_letter_text text,
  status character varying DEFAULT 'pending_mentor'::character varying,
  mentor_name character varying,
  hod_name character varying,
  applied_on timestamp with time zone DEFAULT now(),
  CONSTRAINT noc_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.practical_training_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  title character varying NOT NULL,
  type character varying NOT NULL,
  date_logged date NOT NULL,
  hours integer NOT NULL,
  description text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT practical_training_logs_pkey PRIMARY KEY (id)
);


-- ============================================================-- 11. Moots, Clinics & Extracurriculars============================================================
CREATE TABLE public.moot_competitions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  proposition_url text,
  bidding_deadline timestamp with time zone NOT NULL,
  status character varying DEFAULT 'Open'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT moot_competitions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.moot_bids (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  moot_id uuid,
  student_id uuid,
  research_memo_text text NOT NULL,
  status character varying DEFAULT 'Pending Review'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT moot_bids_pkey PRIMARY KEY (id)
);
CREATE TABLE public.external_moots (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  moot_name character varying NOT NULL,
  level character varying DEFAULT 'National'::character varying,
  event_date date NOT NULL,
  venue character varying,
  status character varying DEFAULT 'Open'::character varying,
  link text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT external_moots_pkey PRIMARY KEY (id)
);
CREATE TABLE public.memorial_vault (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  competition_name character varying NOT NULL,
  year_submitted integer NOT NULL,
  tags jsonb,
  file_url text,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT memorial_vault_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  issuer text NOT NULL,
  date_achieved date NOT NULL,
  role text,
  description text,
  proof_link text,
  include_in_cv boolean DEFAULT true,
  status text DEFAULT 'pending'::text,
  is_verified boolean DEFAULT false,
  mentor_remarks text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  date_achieved date NOT NULL,
  status text DEFAULT 'pending_verification'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.legal_clinics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  faculty_in_charge uuid,
  capacity integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT legal_clinics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clinic_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clinic_id uuid,
  student_id uuid,
  status text DEFAULT 'registered'::text,
  registered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clinic_registrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.legal_aid_cases (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  case_title character varying NOT NULL,
  client_type character varying DEFAULT 'Pro Bono'::character varying,
  assigned_student_id uuid,
  status character varying DEFAULT 'Open'::character varying,
  hours_logged integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT legal_aid_cases_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cle_diaries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  activity_type character varying NOT NULL,
  weeks_logged integer DEFAULT 0,
  diary_content text NOT NULL,
  status character varying DEFAULT 'Pending Approval'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cle_diaries_pkey PRIMARY KEY (id)
);


-- ============================================================-- 12. Disciplinary & Grievances============================================================
CREATE TABLE public.grievances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tracking_code text UNIQUE,
  reporter_id uuid,
  accused_id uuid,
  assigned_to uuid,
  category text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'NORMAL'::text,
  status text DEFAULT 'pending'::text,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grievances_pkey PRIMARY KEY (id)
);
CREATE TABLE public.disciplinary_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  incident_type character varying NOT NULL,
  description text NOT NULL,
  severity character varying DEFAULT 'Low'::character varying,
  action_taken character varying,
  logged_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT disciplinary_logs_pkey PRIMARY KEY (id)
);


-- ============================================================-- 13. Support & Helpdesk============================================================
CREATE TABLE public.helpdesk_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id text UNIQUE,
  user_id uuid,
  category text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open'::text,
  admin_reply text DEFAULT 'Awaiting Support Team Review'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT helpdesk_tickets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.helpdesk_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ticket_id uuid,
  sender_id uuid,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT helpdesk_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.helpdesk_attachments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ticket_id uuid,
  message_id uuid,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT helpdesk_attachments_pkey PRIMARY KEY (id)
);


-- ============================================================-- 14. Mentorship============================================================
CREATE TABLE public.mentorship (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid,
  student_id uuid UNIQUE,
  status text DEFAULT 'active'::text,
  allocated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentorship_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mentorship_meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid,
  student_id uuid,
  topic text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  notes text,
  status text DEFAULT 'completed'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentorship_meetings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mentorship_timeline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  title text NOT NULL,
  description text,
  event_type text CHECK (event_type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'danger'::text])),
  icon text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentorship_timeline_pkey PRIMARY KEY (id)
);


-- ============================================================-- 15. Website, App & Content============================================================
CREATE TABLE public.website_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  page_path character varying NOT NULL,
  section_name character varying NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  section_id text NOT NULL DEFAULT 'hero'::text,
  content_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT website_content_pkey PRIMARY KEY (id)
);
CREATE TABLE public.website_page_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id character varying NOT NULL,
  path character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT website_page_views_pkey PRIMARY KEY (id)
);
CREATE TABLE public.website_clicks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id character varying NOT NULL,
  path character varying NOT NULL,
  element_text character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT website_clicks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.app_releases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  version_code integer NOT NULL,
  version_name text NOT NULL,
  release_notes text,
  apk_url text NOT NULL,
  is_mandatory boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT app_releases_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  status text DEFAULT 'Draft'::text CHECK (status = ANY (ARRAY['Draft'::text, 'Published'::text, 'Archived'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campus_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  event_date date NOT NULL,
  description text,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campus_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campus_facilities (
  id text NOT NULL,
  category_key text NOT NULL,
  category_title text NOT NULL,
  category_desc text,
  title text NOT NULL,
  summary text,
  content text,
  icon text,
  image text,
  tag text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT campus_facilities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  notice_id character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  category character varying NOT NULL,
  target_audience character varying DEFAULT 'global'::character varying,
  target_id character varying,
  priority character varying DEFAULT 'normal'::character varying,
  content text NOT NULL,
  author_name character varying NOT NULL,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT false,
  image_url text,
  slug text,
  author_type character varying,
  author_erp_id character varying,
  author_affiliation character varying,
  author_image_url text,
  author_email character varying,
  author_phone character varying,
  CONSTRAINT notices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notice_bookmarks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  notice_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notice_bookmarks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notice_acknowledgements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  notice_id uuid,
  user_id uuid,
  acknowledged_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notice_acknowledgements_pkey PRIMARY KEY (id)
);


-- ============================================================-- 16. System Settings & Admin Logs============================================================
CREATE TABLE public.system_settings (
  key character varying NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying NOT NULL DEFAULT 'system'::character varying,
  is_read boolean DEFAULT false,
  action_link character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_careers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_careers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admissions_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  program text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT admissions_applications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profile_update_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  requested_changes jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  admin_remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_update_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.erp_password_reset_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institutional_id text NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid,
  CONSTRAINT erp_password_reset_requests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.batch_credential_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  batch_name character varying NOT NULL,
  emails jsonb NOT NULL,
  dispatched_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT batch_credential_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  document_name character varying NOT NULL,
  document_type character varying NOT NULL,
  file_path text NOT NULL,
  file_size_kb integer,
  status character varying DEFAULT 'pending'::character varying,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_documents_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_deadlines (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  title text NOT NULL,
  deadline_type text NOT NULL,
  due_date date NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_deadlines_pkey PRIMARY KEY (id)
);
CREATE TABLE public.isc_rankings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  role character varying DEFAULT 'student'::character varying,
  academic_batch character varying,
  department character varying,
  phone character varying,
  dob date,
  blood_group character varying,
  questionnaire_completed boolean DEFAULT false,
  questionnaire_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT isc_rankings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campus_activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  role character varying,
  action character varying,
  logged_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT campus_activity_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  action character varying NOT NULL,
  table_name character varying NOT NULL,
  record_id character varying,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.research_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  title text NOT NULL,
  type text CHECK (type = ANY (ARRAY['Paper'::text, 'Conference'::text, 'Journal'::text, 'Book Chapter'::text, 'Patent'::text])),
  status text CHECK (status = ANY (ARRAY['Submitted'::text, 'Under Review'::text, 'Revision Requested'::text, 'Approved'::text])),
  mentor_remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT research_submissions_pkey PRIMARY KEY (id)
);


-- ============================================================-- 17. Uncategorized Tables============================================================
CREATE TABLE public.admin_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  description text,
  event_type text DEFAULT 'Academic'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_url text,
  CONSTRAINT admin_events_pkey PRIMARY KEY (id)
);



-- Missing Tables Extracted from ERP Codebase
CREATE TABLE public.contact_inquiries (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying,
    email character varying,
    subject character varying,
    message text,
    status character varying DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id)
);

CREATE TABLE public.career_applications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    job_id uuid,
    applicant_name character varying,
    email character varying,
    resume_url text,
    status character varying DEFAULT 'under_review',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT career_applications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.placement_applications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    drive_id uuid,
    student_id uuid,
    status character varying DEFAULT 'applied',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT placement_applications_pkey PRIMARY KEY (id)
);

CREATE TABLE public.batch_courses (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    batch_id character varying,
    course_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT batch_courses_pkey PRIMARY KEY (id)
);

CREATE TABLE public.mcs_notices (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title character varying,
    content text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mcs_notices_pkey PRIMARY KEY (id)
);

CREATE TABLE public.faculty_stats (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    faculty_id uuid,
    classes_taken integer DEFAULT 0,
    average_rating numeric DEFAULT 0.0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT faculty_stats_pkey PRIMARY KEY (id)
);

CREATE TABLE public.faculty_timetable (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    faculty_id uuid,
    batch_id character varying,
    day_of_week character varying,
    start_time time without time zone,
    end_time time without time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT faculty_timetable_pkey PRIMARY KEY (id)
);


-- Restoring admin_notices (Used for Blogs and Public Notices)
CREATE TABLE public.admin_notices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  notice_id character varying UNIQUE,
  title character varying NOT NULL,
  category character varying NOT NULL,
  target_audience character varying DEFAULT 'global'::character varying,
  target_id character varying,
  priority character varying DEFAULT 'normal'::character varying,
  content text NOT NULL,
  author_name character varying NOT NULL,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  is_public boolean DEFAULT false,
  image_url text,
  slug text,
  author_type character varying,
  author_erp_id character varying,
  author_affiliation character varying,
  author_image_url text,
  author_email character varying,
  author_phone character varying,
  CONSTRAINT admin_notices_pkey PRIMARY KEY (id)
);

-- Restoring academic_events
CREATE TABLE public.academic_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  type character varying DEFAULT 'Academic'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_events_pkey PRIMARY KEY (id)
);


-- ============================================================
-- 17. Missing Codebase Tables (Restored to prevent crashes)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.elective_bids (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    student_id uuid,
    subject_id uuid,
    faculty_id uuid,
    bid_points integer DEFAULT 0,
    status character varying DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT elective_bids_pkey PRIMARY KEY (id)
);

-- FOREIGN KEYS --

ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_replacement_faculty_id_fkey FOREIGN KEY (replacement_faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
ALTER TABLE public.faculty_assignments ADD CONSTRAINT faculty_assignments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES auth.users(id);
ALTER TABLE public.course_materials ADD CONSTRAINT course_materials_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES auth.users(id);
ALTER TABLE public.student_academic_history ADD CONSTRAINT academic_history_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.exams ADD CONSTRAINT exams_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.exam_rooms(id);
ALTER TABLE public.exams ADD CONSTRAINT exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.subjects(id);
ALTER TABLE public.admit_cards ADD CONSTRAINT admit_cards_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id);
ALTER TABLE public.admit_cards ADD CONSTRAINT admit_cards_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.notices ADD CONSTRAINT admin_notices_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);
ALTER TABLE public.student_experiences ADD CONSTRAINT student_experiences_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.noc_requests ADD CONSTRAINT noc_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.practical_training_logs ADD CONSTRAINT practical_training_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.memorial_vault ADD CONSTRAINT memorial_vault_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id);
ALTER TABLE public.batch_credential_logs ADD CONSTRAINT batch_credential_logs_dispatched_by_fkey FOREIGN KEY (dispatched_by) REFERENCES auth.users(id);
ALTER TABLE public.disciplinary_logs ADD CONSTRAINT disciplinary_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.disciplinary_logs ADD CONSTRAINT disciplinary_logs_logged_by_fkey FOREIGN KEY (logged_by) REFERENCES auth.users(id);
ALTER TABLE public.legal_aid_cases ADD CONSTRAINT legal_aid_cases_assigned_student_id_fkey FOREIGN KEY (assigned_student_id) REFERENCES public.profiles(id);
ALTER TABLE public.moot_bids ADD CONSTRAINT moot_bids_moot_id_fkey FOREIGN KEY (moot_id) REFERENCES public.moot_competitions(id);
ALTER TABLE public.moot_bids ADD CONSTRAINT moot_bids_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.cle_diaries ADD CONSTRAINT cle_diaries_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.student_marks ADD CONSTRAINT student_marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.student_marks ADD CONSTRAINT student_marks_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES auth.users(id);
ALTER TABLE public.student_documents ADD CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id);
ALTER TABLE public.faculty_profiles ADD CONSTRAINT faculty_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id);
ALTER TABLE public.class_substitutions ADD CONSTRAINT class_substitutions_original_faculty_id_fkey FOREIGN KEY (original_faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.class_substitutions ADD CONSTRAINT class_substitutions_substitute_faculty_id_fkey FOREIGN KEY (substitute_faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.class_substitutions ADD CONSTRAINT class_substitutions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_schedule(id);
ALTER TABLE public.exam_eligibility ADD CONSTRAINT exam_eligibility_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.exam_eligibility ADD CONSTRAINT exam_eligibility_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id);
ALTER TABLE public.roster_unlocks ADD CONSTRAINT roster_unlocks_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES auth.users(id);
ALTER TABLE public.timetable_reschedules ADD CONSTRAINT timetable_reschedules_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES auth.users(id);
ALTER TABLE public.timetable_reschedules ADD CONSTRAINT timetable_reschedules_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.class_schedule(id);
ALTER TABLE public.mentorship_timeline ADD CONSTRAINT mentorship_timeline_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.internship_requests ADD CONSTRAINT internship_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.research_submissions ADD CONSTRAINT research_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.student_achievements ADD CONSTRAINT student_achievements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.faculty_availability ADD CONSTRAINT faculty_availability_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.student_metrics ADD CONSTRAINT student_metrics_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.student_deadlines ADD CONSTRAINT student_deadlines_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.academic_semesters ADD CONSTRAINT academic_semesters_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);
ALTER TABLE public.subjects ADD CONSTRAINT subjects_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.academic_semesters(id);
ALTER TABLE public.subjects ADD CONSTRAINT subjects_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.subject_modules ADD CONSTRAINT subject_modules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.timetable_changes ADD CONSTRAINT timetable_changes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.timetable_changes ADD CONSTRAINT timetable_changes_new_room_id_fkey FOREIGN KEY (new_room_id) REFERENCES public.academic_classrooms(id);
ALTER TABLE public.notice_bookmarks ADD CONSTRAINT notice_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.notice_acknowledgements ADD CONSTRAINT notice_acknowledgements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.timetable_requests ADD CONSTRAINT timetable_requests_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.timetable_requests ADD CONSTRAINT timetable_requests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions(id);
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.marks_ledger ADD CONSTRAINT marks_ledger_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.marks_ledger ADD CONSTRAINT marks_ledger_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.marks_ledger ADD CONSTRAINT marks_ledger_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.course_resources ADD CONSTRAINT course_resources_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.course_resources ADD CONSTRAINT course_resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.helpdesk_messages ADD CONSTRAINT helpdesk_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);
ALTER TABLE public.helpdesk_attachments ADD CONSTRAINT helpdesk_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.helpdesk_messages(id);
ALTER TABLE public.mentorship ADD CONSTRAINT mentorship_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.mentorship ADD CONSTRAINT mentorship_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.mentorship_meetings ADD CONSTRAINT mentorship_meetings_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.mentorship_meetings ADD CONSTRAINT mentorship_meetings_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.grievances ADD CONSTRAINT grievances_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id);
ALTER TABLE public.grievances ADD CONSTRAINT grievances_accused_id_fkey FOREIGN KEY (accused_id) REFERENCES public.profiles(id);
ALTER TABLE public.grievances ADD CONSTRAINT grievances_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id);
ALTER TABLE public.helpdesk_tickets ADD CONSTRAINT helpdesk_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.fee_ledger ADD CONSTRAINT fee_ledger_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.student_courses ADD CONSTRAINT student_courses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.student_courses ADD CONSTRAINT student_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.subjects(id);
ALTER TABLE public.assignments ADD CONSTRAINT assignments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.assignments ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.subjects(id);
ALTER TABLE public.assignment_submissions ADD CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id);
ALTER TABLE public.assignment_submissions ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.exam_results ADD CONSTRAINT exam_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.exam_results ADD CONSTRAINT exam_results_examination_id_fkey FOREIGN KEY (examination_id) REFERENCES public.exams(id);
ALTER TABLE public.internships ADD CONSTRAINT internships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.achievements ADD CONSTRAINT achievements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.legal_clinics ADD CONSTRAINT legal_clinics_faculty_in_charge_fkey FOREIGN KEY (faculty_in_charge) REFERENCES public.profiles(id);
ALTER TABLE public.clinic_registrations ADD CONSTRAINT clinic_registrations_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.legal_clinics(id);
ALTER TABLE public.clinic_registrations ADD CONSTRAINT clinic_registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.class_schedule ADD CONSTRAINT class_schedule_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);
ALTER TABLE public.class_schedule ADD CONSTRAINT class_schedule_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.academic_classrooms(id);
ALTER TABLE public.class_schedule ADD CONSTRAINT class_schedule_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE public.profile_update_requests ADD CONSTRAINT profile_update_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.erp_password_reset_requests ADD CONSTRAINT erp_password_reset_requests_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id);
ALTER TABLE public.fee_invoices ADD CONSTRAINT fee_invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.fee_transactions ADD CONSTRAINT fee_transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.attendance ADD CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id);
ALTER TABLE public.academic_records ADD CONSTRAINT academic_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.faculty_courses ADD CONSTRAINT faculty_courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id);
ALTER TABLE public.campus_activity_logs ADD CONSTRAINT campus_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
