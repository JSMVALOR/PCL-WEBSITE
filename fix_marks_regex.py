import re

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'r') as f:
    content = f.read()

# 1. We want to remove the `{!subjectContext && (` that wraps the Target Batch entirely.
# Let's find: `{!subjectContext && (\n <div className="flex flex-col gap-2">\n <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>`
# Wait, look at lines 348-350 in the grep output:
# 348- {!subjectContext && (
# 349- <div className="flex flex-col gap-2">
# 350: <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>

pattern_target_batch = re.compile(r'\{\!subjectContext && \(\s*<div className="flex flex-col gap-2">\s*<label className="text-\[13px\] font-medium text-themeTextSec">Target Batch</label>', re.DOTALL)
replacement_target_batch = r"""{(
                            <div className="flex flex-col gap-2">
                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>"""
content = pattern_target_batch.sub(replacement_target_batch, content)

# 2. Add Chevron to Subject
content = re.sub(
    r'(<select\s+className="[^"]*appearance-none"[^>]*value=\{selectedSubject\}.*?</select>)',
    r'<div className="relative">\1<i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>',
    content,
    flags=re.DOTALL
)

# 3. Add Chevron to Target Batch
content = re.sub(
    r'(<select\s+className="[^"]*appearance-none"[^>]*value=\{selectedBatch\}.*?</select>)',
    r'<div className="relative">\1<i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>',
    content,
    flags=re.DOTALL
)

# 4. Add Chevron to Assessment Type
content = re.sub(
    r'(<select\s+className="[^"]*appearance-none"[^>]*value=\{selectedAssessmentType\}.*?</select>)',
    r'<div className="relative">\1<i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec pointer-events-none text-xs"></i></div>',
    content,
    flags=re.DOTALL
)

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'w') as f:
    f.write(content)

