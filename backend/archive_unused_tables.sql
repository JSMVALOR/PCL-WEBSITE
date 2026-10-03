-- ARCHIVE Unused Tables Script
-- This script moves 44 unused "ghost" tables to an 'archive' schema instead of dropping them, preserving data.

CREATE SCHEMA IF NOT EXISTS archive;

DO $$ 
DECLARE 
    t_name text;
    tables_to_archive text[] := ARRAY[


        'academic_years',
        'admit_cards',
        'attendance_audit_logs',
        'batch_courses',
        'batch_credential_logs',
        'campus_activity_logs',
        'campus_events',
        'clinic_registrations',

        'course_modules',
        'disciplinary_logs',

        'erp_password_reset_requests',
        'exam_eligibility',
        'exam_rooms',
        'external_moots',
        'faculty_availability',
        'faculty_courses',
        'faculty_stats',
        'helpdesk_attachments',
        'helpdesk_messages',
        'institution_schedule',

        'isc_rankings',
        'legal_clinics',
        'mcs_notices',
        'memorial_vault',
        'mentorship_timeline',
        'moot_bids',
        'moot_competitions',
        'notice_acknowledgements',
        'notice_bookmarks',
        'research_submissions',
        'roster_unlocks',
        'student_academic_history',
        'student_courses',
        'student_deadlines',
        'student_marks',
        'student_metrics',
        'subject_modules',
        'timetable_changes',
        'timetable_reschedules'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables_to_archive
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I SET SCHEMA archive;', t_name);
            RAISE NOTICE 'Moved % to archive schema.', t_name;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'Table % does not exist in public schema, skipping.', t_name;
        END;
    END LOOP;
END $$;
