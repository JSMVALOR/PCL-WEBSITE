import re, os
code_tables = set()
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            with open(os.path.join(root, file), 'r') as f:
                content = f.read()
                matches = re.findall(r"from\(['\"]([a-zA-Z0-9_]+)['\"]\)", content)
                code_tables.update(matches)

with open('schema_tables_new.txt', 'r') as f:
    schema_tables = set([line.strip() for line in f if line.strip()])

print('--- TABLES QUERIED IN CODE BUT MISSING FROM SCHEMA ---')
missing_in_schema = sorted(list(code_tables - schema_tables))
for t in missing_in_schema:
    print(t)

