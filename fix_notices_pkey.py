import re
with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

# Replace the specific instance in the notices table
# We can just look for the notices table block and replace it there
pattern = r'(CREATE TABLE public\.notices \([^\;]+)CONSTRAINT admin_notices_pkey'
text = re.sub(pattern, r'\1CONSTRAINT notices_pkey', text, flags=re.MULTILINE | re.DOTALL)

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')
