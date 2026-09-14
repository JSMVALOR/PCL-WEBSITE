import re
with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

# Fix student_academic_history
pattern = r'(CREATE TABLE public\.student_academic_history \([^\;]+)CONSTRAINT academic_history_pkey'
text = re.sub(pattern, r'\1CONSTRAINT student_academic_history_pkey', text, flags=re.MULTILINE | re.DOTALL)

# Fix assignment_submissions
pattern = r'(CREATE TABLE public\.assignment_submissions \([^\;]+)CONSTRAINT submissions_pkey'
text = re.sub(pattern, r'\1CONSTRAINT assignment_submissions_pkey', text, flags=re.MULTILINE | re.DOTALL)

# Fix admin_events
pattern = r'(CREATE TABLE public\.admin_events \([^\;]+)CONSTRAINT academic_events_pkey'
text = re.sub(pattern, r'\1CONSTRAINT admin_events_pkey', text, flags=re.MULTILINE | re.DOTALL)

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')
