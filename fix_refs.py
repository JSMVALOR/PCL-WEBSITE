with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

text = text.replace("ALTER TABLE public.leave_applications ", "ALTER TABLE public.faculty_leaves ")

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')
