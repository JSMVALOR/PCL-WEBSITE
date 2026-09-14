import re

with open('supabase/setup_schema.sql', 'r') as f:
    schema = f.read()

tables_to_remove = [
    'bidding_phases', 'elective_catalog', 'student_bidding_wallets', 
    'bidding_ledger', 'elective_bids'
]

for table in tables_to_remove:
    pattern = r'CREATE TABLE public\.' + table + r'\s*\([^;]+;\s*'
    schema = re.sub(pattern, '', schema, flags=re.MULTILINE)

for table in tables_to_remove:
    pattern = r'ALTER TABLE ' + table + r' [^\n]+;\n?'
    schema = re.sub(pattern, '', schema, flags=re.MULTILINE)

# Just completely remove the header for Section 7
schema = re.sub(r'={60}\n-- 7\. Electives & Bidding System\n={60}', '', schema, flags=re.MULTILINE)

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(schema)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + schema + '\n```\n')
