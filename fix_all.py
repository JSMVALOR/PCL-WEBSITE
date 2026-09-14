import re

with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

# 1. Renames
renames = {
    'admin_notices': 'notices',
    'submissions': 'assignment_submissions',
    'academic_history': 'student_academic_history',
    'academic_events': 'admin_events'
}

for old, new in renames.items():
    text = re.sub(rf'\b{old}\b', new, text)

# 2. Leave Applications split
# Find the block for leave_applications and duplicate it
leave_block_pattern = r"CREATE TABLE public\.leave_applications \((.*?)\);"
match = re.search(leave_block_pattern, text, flags=re.DOTALL)
if match:
    leave_content = match.group(1)
    # Replace leave_applications with faculty_leaves and leave_requests
    new_tables = f"CREATE TABLE public.faculty_leaves ({leave_content});\n\nCREATE TABLE public.leave_requests ({leave_content});"
    text = re.sub(leave_block_pattern, new_tables, text, flags=re.DOTALL)
    # Also fix any constraints targeting leave_applications
    text = text.replace("ALTER TABLE leave_applications ", "ALTER TABLE faculty_leaves ")
    # Add constraints for leave_requests
    req_constraints = """
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id);
"""
    text += req_constraints

# 3. Add missing tables mentioned in code
missing_tables = """
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
"""

text = text.replace("-- FOREIGN KEYS --", missing_tables + "\n-- FOREIGN KEYS --")

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')

# 4. Fix React code for `timetable` -> `class_schedule`
# Since class_schedule is used everywhere else.
import os, subprocess
subprocess.run("sed -i '' 's/from(\"timetable\")/from(\"class_schedule\")/g' src/ERP/components/Faculty/Approvals/Approvals.jsx", shell=True)
subprocess.run("sed -i '' 's/from(\\'timetable\\')/from(\\'class_schedule\\')/g' src/ERP/components/Faculty/Approvals/Approvals.jsx", shell=True)

