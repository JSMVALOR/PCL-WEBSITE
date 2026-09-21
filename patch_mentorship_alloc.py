import re
with open('src/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx', 'r') as f:
    content = f.read()

imports = """
import HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';
import { HugeiconsIcon } from '@hugeicons/react';
import Delete02Icon from '@hugeicons/core-free-icons/dist/esm/icons/delete-02';
"""

content = content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';" + imports)

with open('src/ERP/components/Admin/AdminMentorship/MentorshipAllocations.jsx', 'w') as f:
    f.write(content)
