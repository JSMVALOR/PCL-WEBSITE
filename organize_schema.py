import re
from collections import defaultdict

with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

# Separate the foreign keys and extension
parts = text.split('-- FOREIGN KEYS --')
schema_part = parts[0]
fk_part = parts[1] if len(parts) > 1 else ""

# Extract tables
tables = schema_part.split('CREATE TABLE')
extension = tables[0].strip()

table_blocks = {}
for t in tables[1:]:
    t = t.strip()
    if not t: continue
    # extract table name
    first_line = t.split('(')[0]
    table_name = first_line.replace('public.', '').strip()
    table_blocks[table_name] = 'CREATE TABLE ' + t

categories = {
    "1. Users & Core Profiles": [
        "profiles", "user_sessions", "faculty_profiles"
    ],
    "2. Academic Structure": [
        "academic_years", "academic_semesters", "academic_batches", "academic_classrooms",
        "institution_schedule", "academic_calendar"
    ],
    "3. Subjects & Course Content": [
        "subjects", "subject_modules", "course_modules", "course_materials", "course_resources",
        "student_courses", "faculty_courses", "faculty_assignments"
    ],
    "4. Timetable & Scheduling": [
        "class_schedule", "class_sessions", "class_substitutions", 
        "timetable_requests", "timetable_changes", "timetable_reschedules", 
        "roster_unlocks", "faculty_availability", "rooms"
    ],
    "5. Attendance & Student Metrics": [
        "attendance", "attendance_records", "student_metrics", "academic_records", "academic_history"
    ],
    "6. Exams & Grading": [
        "exams", "exam_rooms", "exam_eligibility", "exam_results", "admit_cards",
        "assignments", "submissions", "marks_ledger", "student_marks"
    ],
    "7. Electives & Bidding System": [
        "bidding_phases", "elective_catalog", "student_bidding_wallets", "bidding_ledger", "elective_bids"
    ],
    "8. Leaves & Out of Office": [
        "leave_policies", "leave_applications", "leave_audit_logs"
    ],
    "9. Fees & Finance": [
        "fee_ledger", "fee_invoices", "fee_transactions"
    ],
    "10. Careers, Placements & Internships": [
        "placement_drives", "placement_inquiries", "internships", "internship_requests", 
        "student_experiences", "noc_requests", "practical_training_logs"
    ],
    "11. Moots, Clinics & Extracurriculars": [
        "moot_competitions", "moot_bids", "external_moots", "memorial_vault", 
        "student_achievements", "achievements", "legal_clinics", "clinic_registrations", 
        "legal_aid_cases", "cle_diaries"
    ],
    "12. Disciplinary & Grievances": [
        "grievances", "disciplinary_logs"
    ],
    "13. Support & Helpdesk": [
        "helpdesk_tickets", "helpdesk_messages", "helpdesk_attachments"
    ],
    "14. Mentorship": [
        "mentorship", "mentorship_meetings", "mentorship_timeline"
    ],
    "15. Website, App & Content": [
        "website_content", "website_page_views", "website_clicks", "app_releases", "blogs", 
        "campus_events", "campus_facilities", "admin_notices", "notice_bookmarks", "notice_acknowledgements"
    ],
    "16. System Settings & Admin Logs": [
        "system_settings", "notifications", "admin_careers", "admissions_applications", 
        "profile_update_requests", "erp_password_reset_requests", "batch_credential_logs", 
        "student_documents", "student_deadlines", "isc_rankings", "campus_activity_logs", 
        "audit_logs", "research_submissions"
    ]
}

out_lines = [extension, "\n"]
processed_tables = set()

for cat_name, tbl_list in categories.items():
    out_lines.append(f"\n\n{'='*60}")
    out_lines.append(f"-- {cat_name}")
    out_lines.append(f"{'='*60}\n")
    
    for tbl in tbl_list:
        if tbl in table_blocks:
            out_lines.append(table_blocks[tbl] + "\n")
            processed_tables.add(tbl)

# Catch any unmapped tables
unmapped = [tbl for tbl in table_blocks.keys() if tbl not in processed_tables]
if unmapped:
    out_lines.append(f"\n\n{'='*60}")
    out_lines.append(f"-- 17. Uncategorized Tables")
    out_lines.append(f"{'='*60}\n")
    for tbl in unmapped:
        out_lines.append(table_blocks[tbl] + "\n")

final_schema = "".join(out_lines) + "\n\n-- FOREIGN KEYS --\n" + fk_part

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(final_schema)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + final_schema + '\n```\n')
