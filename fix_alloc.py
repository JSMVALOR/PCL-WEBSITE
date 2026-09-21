import re
with open('src/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx', 'r') as f:
    content = f.read()

imports = """
import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
"""
content = re.sub(r'(import React.*?;\n)', r'\1' + imports, content, count=1)

with open('src/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx', 'w') as f:
    f.write(content)
