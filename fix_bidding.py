import re

with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

tables_to_remove = [
    'bidding_phases', 'elective_catalog', 'student_bidding_wallets', 
    'bidding_ledger', 'elective_bids'
]

# Remove ALTER TABLE constraints for these tables
for table in tables_to_remove:
    pattern = r'ALTER TABLE public\.' + table + r' [^\n]+;\n?'
    text = re.sub(pattern, '', text, flags=re.MULTILINE)

# Just in case, clean up any header leftovers
text = re.sub(r'-- ============================================================-- 7\. Electives & Bidding System============================================================\n?', '', text)

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')
