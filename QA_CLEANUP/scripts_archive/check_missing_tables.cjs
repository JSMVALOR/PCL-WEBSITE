const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

const tables = [
"academic_batches", "academic_calendar", "academic_classrooms", "academic_events", "academic_programs", "admin_careers", "admin_events", "admin_notices", "admissions_applications", "assignment_submissions", "assignments", "attendance", "attendance_audit_logs", "attendance_records", "audit_logs", "career_applications", "class_schedule", "class_sessions", "cle_diaries", "cohort_subjects", "contact_inquiries", "course_resources", "elective_bids", "exam_results", "faculty_attendance_log", "faculty_leave_requests", "faculty_leaves", "faculty_payroll", "faculty_profiles", "faculty_timetable", "fee_invoices", "fee_transactions", "grievances", "helpdesk_tickets", "isc_rankings", "leave_audit_logs", "leave_requests", "marks_ledger", "master_subjects", "mcs_notices", "memorial_vault", "mentorship", "mentorship_meetings", "mentorship_notes", "moot_bids", "moot_competitions", "noc_requests", "notice_acknowledgements", "notices", "parent_student_mappings", "placement_applications", "placement_drives", "placement_inquiries", "practical_training_logs", "profile_update_requests", "profiles", "recurring_expenses", "rooms", "student_achievements", "student_documents", "student_experiences", "student_grades", "student_marks", "student_requests", "student_semester_analytics", "system_settings", "timetable_requests", "user_sessions", "website_clicks", "website_page_views"
];

async function run() {
    let missing = [];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error && error.code === '42P01') { // undefined table
            missing.push(table);
        } else if (error && error.message.includes('find the table')) {
            missing.push(table);
        }
    }
    console.log("MISSING TABLES:", missing);
}
run();
