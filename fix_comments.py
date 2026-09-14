with open('supabase/setup_schema.sql', 'r') as f:
    text = f.read()

import re
# Replace lines starting with === with -- ===
text = re.sub(r'^=+', lambda m: '-- ' + m.group(0), text, flags=re.MULTILINE)

with open('supabase/setup_schema.sql', 'w') as f:
    f.write(text)

with open('/Users/JSM/.gemini/antigravity/brain/9f6746fa-b4bd-4273-a0f7-d4a7f8c46214/fixed_schema.md', 'w') as f:
    f.write('```sql\n' + text + '\n```\n')
