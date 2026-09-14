with open('schema_tables_new.txt', 'r') as f:
    tables = [line.strip() for line in f if line.strip()]

# Include the ones we tried to remove but might still exist in the DB
tables += ['elective_bids', 'bidding_phases', 'elective_catalog', 'student_bidding_wallets', 'bidding_ledger', 'leave_applications']

sql = ""
for t in set(tables):
    sql += f"DROP TABLE IF EXISTS public.{t} CASCADE;\n"

with open('supabase/reset_db.sql', 'w') as f:
    f.write(sql)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/reset_db.md', 'w') as f:
    f.write('```sql\n' + sql + '\n```\n')

