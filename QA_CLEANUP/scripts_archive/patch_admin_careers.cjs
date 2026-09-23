const fs = require('fs');
const file = 'src/ERP/components/Admin/AdminWebsiteHub/AdminCareers.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('HoldButton')) {
    content = content.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport HoldButton from '../../../../Shared/components/ReactBits/HoldButton/HoldButton';\nimport { HugeiconsIcon } from '@hugeicons/react';\nimport { Delete02Icon } from '@hugeicons/core-free-icons';"
    );
}

// Remove confirm
content = content.replace(
    'if (!window.confirm("Are you sure you want to permanently delete this job posting?")) return;',
    '// window.confirm removed, using HoldButton'
);

// Replace button
const btnOld = `<button type="button" onClick={handleDelete} className="px-6 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-gray-900 dark:text-white border border-rose-500/20 text-[14px] font-medium tracking-normal rounded-lg transition-colors">
 Delete Job
 </button>`;

const btnNew = `<HoldButton
  onHold={handleDelete}
  backgroundColor="rgba(244, 63, 94, 0.1)"
  fillColor="#f43f5e"
  textColor="#f43f5e"
  doneLabel="Deleted"
  icon={<HugeiconsIcon icon={Delete02Icon} size={18} />}
  radius={8}
  size="md"
>
  Hold to Delete
</HoldButton>`;

content = content.replace(btnOld, btnNew);
fs.writeFileSync(file, content);
