-- FIX MISSING RLS
ALTER TABLE public.academic_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_credential_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cle_diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elective_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_moots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isc_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_aid_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcs_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorial_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moot_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moot_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practical_training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roster_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_reschedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_page_views ENABLE ROW LEVEL SECURITY;

-- WARNING: RLS has been enabled on the above tables.
-- If they do not have specific policies, they will default to DENY ALL.
-- Ensure you have appropriate policies for these tables.

-- FIX MISSING ON DELETE CASCADE FOR FOREIGN KEYS
-- Table: faculty_leaves, Constraint: leave_applications_student_id_fkey
ALTER TABLE public.faculty_leaves DROP CONSTRAINT IF EXISTS leave_applications_student_id_fkey;
ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: faculty_leaves, Constraint: leave_applications_faculty_id_fkey
ALTER TABLE public.faculty_leaves DROP CONSTRAINT IF EXISTS leave_applications_faculty_id_fkey;
ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: faculty_leaves, Constraint: leave_applications_replacement_faculty_id_fkey
ALTER TABLE public.faculty_leaves DROP CONSTRAINT IF EXISTS leave_applications_replacement_faculty_id_fkey;
ALTER TABLE public.faculty_leaves ADD CONSTRAINT leave_applications_replacement_faculty_id_fkey FOREIGN KEY (replacement_faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: exams, Constraint: exams_room_id_fkey
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_room_id_fkey;
ALTER TABLE public.exams ADD CONSTRAINT exams_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.exam_rooms(id) ON DELETE CASCADE;

-- Table: exams, Constraint: exams_course_id_fkey
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_course_id_fkey;
ALTER TABLE public.exams ADD CONSTRAINT exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: admit_cards, Constraint: admit_cards_exam_id_fkey
ALTER TABLE public.admit_cards DROP CONSTRAINT IF EXISTS admit_cards_exam_id_fkey;
ALTER TABLE public.admit_cards ADD CONSTRAINT admit_cards_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

-- Table: disciplinary_logs, Constraint: disciplinary_logs_student_id_fkey
ALTER TABLE public.disciplinary_logs DROP CONSTRAINT IF EXISTS disciplinary_logs_student_id_fkey;
ALTER TABLE public.disciplinary_logs ADD CONSTRAINT disciplinary_logs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: legal_aid_cases, Constraint: legal_aid_cases_assigned_student_id_fkey
ALTER TABLE public.legal_aid_cases DROP CONSTRAINT IF EXISTS legal_aid_cases_assigned_student_id_fkey;
ALTER TABLE public.legal_aid_cases ADD CONSTRAINT legal_aid_cases_assigned_student_id_fkey FOREIGN KEY (assigned_student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: moot_bids, Constraint: moot_bids_moot_id_fkey
ALTER TABLE public.moot_bids DROP CONSTRAINT IF EXISTS moot_bids_moot_id_fkey;
ALTER TABLE public.moot_bids ADD CONSTRAINT moot_bids_moot_id_fkey FOREIGN KEY (moot_id) REFERENCES public.moot_competitions(id) ON DELETE CASCADE;

-- Table: faculty_profiles, Constraint: faculty_profiles_id_fkey
ALTER TABLE public.faculty_profiles DROP CONSTRAINT IF EXISTS faculty_profiles_id_fkey;
ALTER TABLE public.faculty_profiles ADD CONSTRAINT faculty_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: class_substitutions, Constraint: class_substitutions_original_faculty_id_fkey
ALTER TABLE public.class_substitutions DROP CONSTRAINT IF EXISTS class_substitutions_original_faculty_id_fkey;
ALTER TABLE public.class_substitutions ADD CONSTRAINT class_substitutions_original_faculty_id_fkey FOREIGN KEY (original_faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: class_substitutions, Constraint: class_substitutions_substitute_faculty_id_fkey
ALTER TABLE public.class_substitutions DROP CONSTRAINT IF EXISTS class_substitutions_substitute_faculty_id_fkey;
ALTER TABLE public.class_substitutions ADD CONSTRAINT class_substitutions_substitute_faculty_id_fkey FOREIGN KEY (substitute_faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: class_substitutions, Constraint: class_substitutions_class_id_fkey
ALTER TABLE public.class_substitutions DROP CONSTRAINT IF EXISTS class_substitutions_class_id_fkey;
ALTER TABLE public.class_substitutions ADD CONSTRAINT class_substitutions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_schedule(id) ON DELETE CASCADE;

-- Table: exam_eligibility, Constraint: exam_eligibility_student_id_fkey
ALTER TABLE public.exam_eligibility DROP CONSTRAINT IF EXISTS exam_eligibility_student_id_fkey;
ALTER TABLE public.exam_eligibility ADD CONSTRAINT exam_eligibility_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: exam_eligibility, Constraint: exam_eligibility_exam_id_fkey
ALTER TABLE public.exam_eligibility DROP CONSTRAINT IF EXISTS exam_eligibility_exam_id_fkey;
ALTER TABLE public.exam_eligibility ADD CONSTRAINT exam_eligibility_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

-- Table: timetable_reschedules, Constraint: timetable_reschedules_timetable_id_fkey
ALTER TABLE public.timetable_reschedules DROP CONSTRAINT IF EXISTS timetable_reschedules_timetable_id_fkey;
ALTER TABLE public.timetable_reschedules ADD CONSTRAINT timetable_reschedules_timetable_id_fkey FOREIGN KEY (timetable_id) REFERENCES public.class_schedule(id) ON DELETE CASCADE;

-- Table: mentorship_timeline, Constraint: mentorship_timeline_student_id_fkey
ALTER TABLE public.mentorship_timeline DROP CONSTRAINT IF EXISTS mentorship_timeline_student_id_fkey;
ALTER TABLE public.mentorship_timeline ADD CONSTRAINT mentorship_timeline_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: internship_requests, Constraint: internship_requests_student_id_fkey
ALTER TABLE public.internship_requests DROP CONSTRAINT IF EXISTS internship_requests_student_id_fkey;
ALTER TABLE public.internship_requests ADD CONSTRAINT internship_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: research_submissions, Constraint: research_submissions_student_id_fkey
ALTER TABLE public.research_submissions DROP CONSTRAINT IF EXISTS research_submissions_student_id_fkey;
ALTER TABLE public.research_submissions ADD CONSTRAINT research_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: student_achievements, Constraint: student_achievements_student_id_fkey
ALTER TABLE public.student_achievements DROP CONSTRAINT IF EXISTS student_achievements_student_id_fkey;
ALTER TABLE public.student_achievements ADD CONSTRAINT student_achievements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: faculty_availability, Constraint: faculty_availability_faculty_id_fkey
ALTER TABLE public.faculty_availability DROP CONSTRAINT IF EXISTS faculty_availability_faculty_id_fkey;
ALTER TABLE public.faculty_availability ADD CONSTRAINT faculty_availability_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: student_metrics, Constraint: student_metrics_student_id_fkey
ALTER TABLE public.student_metrics DROP CONSTRAINT IF EXISTS student_metrics_student_id_fkey;
ALTER TABLE public.student_metrics ADD CONSTRAINT student_metrics_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: student_deadlines, Constraint: student_deadlines_student_id_fkey
ALTER TABLE public.student_deadlines DROP CONSTRAINT IF EXISTS student_deadlines_student_id_fkey;
ALTER TABLE public.student_deadlines ADD CONSTRAINT student_deadlines_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: academic_semesters, Constraint: academic_semesters_academic_year_id_fkey
ALTER TABLE public.academic_semesters DROP CONSTRAINT IF EXISTS academic_semesters_academic_year_id_fkey;
ALTER TABLE public.academic_semesters ADD CONSTRAINT academic_semesters_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id) ON DELETE CASCADE;

-- Table: subject_modules, Constraint: subject_modules_subject_id_fkey
-- ALTER TABLE public.subject_modules DROP CONSTRAINT IF EXISTS subject_modules_subject_id_fkey;
-- ALTER TABLE public.subject_modules ADD CONSTRAINT subject_modules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: timetable_changes, Constraint: timetable_changes_subject_id_fkey
-- ALTER TABLE public.timetable_changes DROP CONSTRAINT IF EXISTS timetable_changes_subject_id_fkey;
-- ALTER TABLE public.timetable_changes ADD CONSTRAINT timetable_changes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: timetable_changes, Constraint: timetable_changes_new_room_id_fkey
-- ALTER TABLE public.timetable_changes DROP CONSTRAINT IF EXISTS timetable_changes_new_room_id_fkey;
-- ALTER TABLE public.timetable_changes ADD CONSTRAINT timetable_changes_new_room_id_fkey FOREIGN KEY (new_room_id) REFERENCES public.academic_classrooms(id) ON DELETE CASCADE;

-- Table: notice_bookmarks, Constraint: notice_bookmarks_user_id_fkey
-- ALTER TABLE public.notice_bookmarks DROP CONSTRAINT IF EXISTS notice_bookmarks_user_id_fkey;
-- ALTER TABLE public.notice_bookmarks ADD CONSTRAINT notice_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: notice_acknowledgements, Constraint: notice_acknowledgements_user_id_fkey
-- ALTER TABLE public.notice_acknowledgements DROP CONSTRAINT IF EXISTS notice_acknowledgements_user_id_fkey;
-- ALTER TABLE public.notice_acknowledgements ADD CONSTRAINT notice_acknowledgements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: timetable_requests, Constraint: timetable_requests_faculty_id_fkey
ALTER TABLE public.timetable_requests DROP CONSTRAINT IF EXISTS timetable_requests_faculty_id_fkey;
ALTER TABLE public.timetable_requests ADD CONSTRAINT timetable_requests_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: timetable_requests, Constraint: timetable_requests_subject_id_fkey
ALTER TABLE public.timetable_requests DROP CONSTRAINT IF EXISTS timetable_requests_subject_id_fkey;
ALTER TABLE public.timetable_requests ADD CONSTRAINT timetable_requests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: class_sessions, Constraint: class_sessions_faculty_id_fkey
ALTER TABLE public.class_sessions DROP CONSTRAINT IF EXISTS class_sessions_faculty_id_fkey;
ALTER TABLE public.class_sessions ADD CONSTRAINT class_sessions_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: attendance_records, Constraint: attendance_records_session_id_fkey
ALTER TABLE public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_session_id_fkey;
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions(id) ON DELETE CASCADE;

-- Table: attendance_records, Constraint: attendance_records_student_id_fkey
ALTER TABLE public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_student_id_fkey;
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: marks_ledger, Constraint: marks_ledger_faculty_id_fkey
ALTER TABLE public.marks_ledger DROP CONSTRAINT IF EXISTS marks_ledger_faculty_id_fkey;
ALTER TABLE public.marks_ledger ADD CONSTRAINT marks_ledger_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: marks_ledger, Constraint: marks_ledger_subject_id_fkey
ALTER TABLE public.marks_ledger DROP CONSTRAINT IF EXISTS marks_ledger_subject_id_fkey;
ALTER TABLE public.marks_ledger ADD CONSTRAINT marks_ledger_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: marks_ledger, Constraint: marks_ledger_student_id_fkey
ALTER TABLE public.marks_ledger DROP CONSTRAINT IF EXISTS marks_ledger_student_id_fkey;
ALTER TABLE public.marks_ledger ADD CONSTRAINT marks_ledger_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: course_resources, Constraint: course_resources_faculty_id_fkey
ALTER TABLE public.course_resources DROP CONSTRAINT IF EXISTS course_resources_faculty_id_fkey;
ALTER TABLE public.course_resources ADD CONSTRAINT course_resources_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: course_resources, Constraint: course_resources_cohort_subject_id_fkey
ALTER TABLE public.course_resources DROP CONSTRAINT IF EXISTS course_resources_cohort_subject_id_fkey;
ALTER TABLE public.course_resources ADD CONSTRAINT course_resources_cohort_subject_id_fkey FOREIGN KEY (cohort_subject_id) REFERENCES public.cohort_subjects(id) ON DELETE CASCADE;

-- Table: helpdesk_messages, Constraint: helpdesk_messages_sender_id_fkey
ALTER TABLE public.helpdesk_messages DROP CONSTRAINT IF EXISTS helpdesk_messages_sender_id_fkey;
ALTER TABLE public.helpdesk_messages ADD CONSTRAINT helpdesk_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: helpdesk_attachments, Constraint: helpdesk_attachments_message_id_fkey
ALTER TABLE public.helpdesk_attachments DROP CONSTRAINT IF EXISTS helpdesk_attachments_message_id_fkey;
ALTER TABLE public.helpdesk_attachments ADD CONSTRAINT helpdesk_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.helpdesk_messages(id) ON DELETE CASCADE;

-- Table: mentorship, Constraint: mentorship_faculty_id_fkey
ALTER TABLE public.mentorship DROP CONSTRAINT IF EXISTS mentorship_faculty_id_fkey;
ALTER TABLE public.mentorship ADD CONSTRAINT mentorship_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: mentorship, Constraint: mentorship_student_id_fkey
ALTER TABLE public.mentorship DROP CONSTRAINT IF EXISTS mentorship_student_id_fkey;
ALTER TABLE public.mentorship ADD CONSTRAINT mentorship_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: mentorship_meetings, Constraint: mentorship_meetings_faculty_id_fkey
ALTER TABLE public.mentorship_meetings DROP CONSTRAINT IF EXISTS mentorship_meetings_faculty_id_fkey;
ALTER TABLE public.mentorship_meetings ADD CONSTRAINT mentorship_meetings_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: mentorship_meetings, Constraint: mentorship_meetings_student_id_fkey
ALTER TABLE public.mentorship_meetings DROP CONSTRAINT IF EXISTS mentorship_meetings_student_id_fkey;
ALTER TABLE public.mentorship_meetings ADD CONSTRAINT mentorship_meetings_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: grievances, Constraint: grievances_reporter_id_fkey
ALTER TABLE public.grievances DROP CONSTRAINT IF EXISTS grievances_reporter_id_fkey;
ALTER TABLE public.grievances ADD CONSTRAINT grievances_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: grievances, Constraint: grievances_accused_id_fkey
ALTER TABLE public.grievances DROP CONSTRAINT IF EXISTS grievances_accused_id_fkey;
ALTER TABLE public.grievances ADD CONSTRAINT grievances_accused_id_fkey FOREIGN KEY (accused_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: grievances, Constraint: grievances_assigned_to_fkey
ALTER TABLE public.grievances DROP CONSTRAINT IF EXISTS grievances_assigned_to_fkey;
ALTER TABLE public.grievances ADD CONSTRAINT grievances_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: helpdesk_tickets, Constraint: helpdesk_tickets_user_id_fkey
ALTER TABLE public.helpdesk_tickets DROP CONSTRAINT IF EXISTS helpdesk_tickets_user_id_fkey;
ALTER TABLE public.helpdesk_tickets ADD CONSTRAINT helpdesk_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: fee_ledger, Constraint: fee_ledger_student_id_fkey
ALTER TABLE public.fee_ledger DROP CONSTRAINT IF EXISTS fee_ledger_student_id_fkey;
ALTER TABLE public.fee_ledger ADD CONSTRAINT fee_ledger_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: student_courses, Constraint: student_courses_student_id_fkey
ALTER TABLE public.student_courses DROP CONSTRAINT IF EXISTS student_courses_student_id_fkey;
ALTER TABLE public.student_courses ADD CONSTRAINT student_courses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: student_courses, Constraint: student_courses_course_id_fkey
ALTER TABLE public.student_courses DROP CONSTRAINT IF EXISTS student_courses_course_id_fkey;
ALTER TABLE public.student_courses ADD CONSTRAINT student_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: assignments, Constraint: assignments_faculty_id_fkey
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_faculty_id_fkey;
ALTER TABLE public.assignments ADD CONSTRAINT assignments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: assignments, Constraint: assignments_course_id_fkey
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_course_id_fkey;
ALTER TABLE public.assignments ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: assignment_submissions, Constraint: submissions_assignment_id_fkey
ALTER TABLE public.assignment_submissions DROP CONSTRAINT IF EXISTS submissions_assignment_id_fkey;
ALTER TABLE public.assignment_submissions ADD CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

-- Table: assignment_submissions, Constraint: submissions_student_id_fkey
ALTER TABLE public.assignment_submissions DROP CONSTRAINT IF EXISTS submissions_student_id_fkey;
ALTER TABLE public.assignment_submissions ADD CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: exam_results, Constraint: exam_results_student_id_fkey
ALTER TABLE public.exam_results DROP CONSTRAINT IF EXISTS exam_results_student_id_fkey;
ALTER TABLE public.exam_results ADD CONSTRAINT exam_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: exam_results, Constraint: exam_results_examination_id_fkey
-- ALTER TABLE public.exam_results DROP CONSTRAINT IF EXISTS exam_results_examination_id_fkey;
-- ALTER TABLE public.exam_results ADD CONSTRAINT exam_results_examination_id_fkey FOREIGN KEY (examination_id) REFERENCES public.exams(id) ON DELETE CASCADE;

-- Table: internships, Constraint: internships_student_id_fkey
ALTER TABLE public.internships DROP CONSTRAINT IF EXISTS internships_student_id_fkey;
ALTER TABLE public.internships ADD CONSTRAINT internships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: achievements, Constraint: achievements_student_id_fkey
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_student_id_fkey;
ALTER TABLE public.achievements ADD CONSTRAINT achievements_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: legal_clinics, Constraint: legal_clinics_faculty_in_charge_fkey
ALTER TABLE public.legal_clinics DROP CONSTRAINT IF EXISTS legal_clinics_faculty_in_charge_fkey;
ALTER TABLE public.legal_clinics ADD CONSTRAINT legal_clinics_faculty_in_charge_fkey FOREIGN KEY (faculty_in_charge) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: clinic_registrations, Constraint: clinic_registrations_clinic_id_fkey
ALTER TABLE public.clinic_registrations DROP CONSTRAINT IF EXISTS clinic_registrations_clinic_id_fkey;
ALTER TABLE public.clinic_registrations ADD CONSTRAINT clinic_registrations_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.legal_clinics(id) ON DELETE CASCADE;

-- Table: clinic_registrations, Constraint: clinic_registrations_student_id_fkey
ALTER TABLE public.clinic_registrations DROP CONSTRAINT IF EXISTS clinic_registrations_student_id_fkey;
ALTER TABLE public.clinic_registrations ADD CONSTRAINT clinic_registrations_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: class_schedule, Constraint: class_schedule_subject_id_fkey
ALTER TABLE public.class_schedule DROP CONSTRAINT IF EXISTS class_schedule_subject_id_fkey;
ALTER TABLE public.class_schedule ADD CONSTRAINT class_schedule_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.master_subjects(id) ON DELETE CASCADE;

-- Table: class_schedule, Constraint: class_schedule_room_id_fkey
ALTER TABLE public.class_schedule DROP CONSTRAINT IF EXISTS class_schedule_room_id_fkey;
ALTER TABLE public.class_schedule ADD CONSTRAINT class_schedule_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.academic_classrooms(id) ON DELETE CASCADE;

-- Table: class_schedule, Constraint: class_schedule_faculty_id_fkey
ALTER TABLE public.class_schedule DROP CONSTRAINT IF EXISTS class_schedule_faculty_id_fkey;
ALTER TABLE public.class_schedule ADD CONSTRAINT class_schedule_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: notifications, Constraint: notifications_user_id_fkey
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: profile_update_requests, Constraint: profile_update_requests_student_id_fkey
ALTER TABLE public.profile_update_requests DROP CONSTRAINT IF EXISTS profile_update_requests_student_id_fkey;
ALTER TABLE public.profile_update_requests ADD CONSTRAINT profile_update_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: erp_password_reset_requests, Constraint: erp_password_reset_requests_resolved_by_fkey
ALTER TABLE public.erp_password_reset_requests DROP CONSTRAINT IF EXISTS erp_password_reset_requests_resolved_by_fkey;
ALTER TABLE public.erp_password_reset_requests ADD CONSTRAINT erp_password_reset_requests_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: fee_invoices, Constraint: fee_invoices_student_id_fkey
ALTER TABLE public.fee_invoices DROP CONSTRAINT IF EXISTS fee_invoices_student_id_fkey;
ALTER TABLE public.fee_invoices ADD CONSTRAINT fee_invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: fee_transactions, Constraint: fee_transactions_student_id_fkey
ALTER TABLE public.fee_transactions DROP CONSTRAINT IF EXISTS fee_transactions_student_id_fkey;
ALTER TABLE public.fee_transactions ADD CONSTRAINT fee_transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: attendance, Constraint: attendance_student_id_fkey
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: attendance, Constraint: attendance_recorded_by_fkey
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_recorded_by_fkey;
ALTER TABLE public.attendance ADD CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: academic_records, Constraint: academic_records_student_id_fkey
ALTER TABLE public.academic_records DROP CONSTRAINT IF EXISTS academic_records_student_id_fkey;
ALTER TABLE public.academic_records ADD CONSTRAINT academic_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: faculty_courses, Constraint: faculty_courses_faculty_id_fkey
ALTER TABLE public.faculty_courses DROP CONSTRAINT IF EXISTS faculty_courses_faculty_id_fkey;
ALTER TABLE public.faculty_courses ADD CONSTRAINT faculty_courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: campus_activity_logs, Constraint: campus_activity_logs_user_id_fkey
-- ALTER TABLE public.campus_activity_logs DROP CONSTRAINT IF EXISTS campus_activity_logs_user_id_fkey;
-- ALTER TABLE public.campus_activity_logs ADD CONSTRAINT campus_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: leave_requests, Constraint: leave_requests_student_id_fkey
ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_student_id_fkey;
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: faculty_payroll, Constraint: faculty_payroll_faculty_id_fkey
ALTER TABLE public.faculty_payroll DROP CONSTRAINT IF EXISTS faculty_payroll_faculty_id_fkey;
ALTER TABLE public.faculty_payroll ADD CONSTRAINT faculty_payroll_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Table: faculty_daily_presence, Constraint: faculty_daily_presence_faculty_id_fkey
ALTER TABLE public.faculty_daily_presence DROP CONSTRAINT IF EXISTS faculty_daily_presence_faculty_id_fkey;
ALTER TABLE public.faculty_daily_presence ADD CONSTRAINT faculty_daily_presence_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- FIX SECURITY DEFINER FUNCTIONS MISSING SET search_path
ALTER FUNCTION public.admin_update_faculty_record SET search_path = public;
ALTER FUNCTION public.get_top_website_clicks SET search_path = public;
ALTER FUNCTION public.get_admin_kpi_stats SET search_path = public;
ALTER FUNCTION public.admin_create_user SET search_path = public;
ALTER FUNCTION public.admin_reassign_faculty_workload SET search_path = public;
ALTER FUNCTION public.check_triggers SET search_path = public;
ALTER FUNCTION public.admin_update_master_record SET search_path = public;
ALTER FUNCTION public.admin_update_profile_status SET search_path = public;
ALTER FUNCTION public.get_system_vitals SET search_path = public;
ALTER FUNCTION public.get_admin_dashboard_stats SET search_path = public;
ALTER FUNCTION public.admin_delete_user SET search_path = public;
