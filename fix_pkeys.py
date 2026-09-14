import re

with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

# Fix faculty_leaves
faculty_block_pattern = r"(CREATE TABLE public\.faculty_leaves \([^;]+)CONSTRAINT leave_applications_pkey"
text = re.sub(faculty_block_pattern, r"\1CONSTRAINT faculty_leaves_pkey", text, flags=re.MULTILINE | re.DOTALL)

# Fix leave_requests
req_block_pattern = r"(CREATE TABLE public\.leave_requests \([^;]+)CONSTRAINT leave_applications_pkey"
text = re.sub(req_block_pattern, r"\1CONSTRAINT leave_requests_pkey", text, flags=re.MULTILINE | re.DOTALL)

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')
