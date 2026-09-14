with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

# I will append the missing tables just before the FOREIGN KEYS section
missing_tables = """
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
"""

if "CREATE TABLE public.elective_bids" not in text:
    text = text.replace("-- FOREIGN KEYS --", missing_tables + "\n-- FOREIGN KEYS --")

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')

