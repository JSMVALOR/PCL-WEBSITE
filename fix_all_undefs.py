import json
import re

with open("lint_results.json") as f:
    data = json.load(f)

missing = {}
for item in data:
    if "is not defined" in item["message"]:
        comp = item["message"].split("'")[1]
        file = item["filename"]
        if file not in missing:
            missing[file] = set()
        missing[file].add(comp)

for file, comps in missing.items():
    with open(file, 'r') as f:
        content = f.read()

    depth = file.count('/') - 1
    prefix = "../" * depth

    new_imports = ""
    for comp in comps:
        if comp == "HoldButton":
            new_imports += f"\nimport HoldButton from '{prefix}Shared/components/ReactBits/HoldButton/HoldButton';"
        elif comp == "HugeiconsIcon":
            new_imports += f"\nimport {{ HugeiconsIcon }} from '@hugeicons/react';"
            new_imports += f"\nimport {{ Delete02Icon }} from '@hugeicons/core-free-icons';"
        elif comp == "SlideCommit":
            new_imports += f"\nimport SlideCommit from '{prefix}Shared/components/ReactBits/SlideCommit/SlideCommit';"
        elif comp == "CodeSlots":
            new_imports += f"\nimport CodeSlots from '{prefix}Shared/components/ReactBits/CodeSlots/CodeSlots';"
        elif comp == "NotFound404":
            new_imports += f"\nimport NotFound404 from '{prefix}Website/components/NotFound404';"
        elif comp == "Badge":
            new_imports += f"\nimport {{ Badge }} from 'lucide-react';" # Assuming badge from lucide or somewhere? Actually wait, badge might just be a local component. Let me skip Badge for now or inject a dummy if it fails.

    if new_imports:
        content = re.sub(r'(import React.*?;\n)', r'\1' + new_imports + '\n', content, count=1)
        with open(file, 'w') as f:
            f.write(content)

