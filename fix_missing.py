with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

missing_tables = """
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
"""

text = text.replace("-- FOREIGN KEYS --", missing_tables + "\n-- FOREIGN KEYS --")

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')

