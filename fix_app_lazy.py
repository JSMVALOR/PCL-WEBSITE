import re
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Replace React.lazy with static imports
def repl(match):
    comp = match.group(1)
    path = match.group(2)
    return f"import {comp} from {path};"

content = re.sub(r'const\s+(\w+)\s*=\s*React\.lazy\(\(\)\s*=>\s*import\((.*?)\)\);', repl, content)

with open('src/App.jsx', 'w') as f:
    f.write(content)
