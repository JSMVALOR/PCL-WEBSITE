import re

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'r') as f:
    content = f.read()

# We want to find:
# {(
#                            <div className="flex flex-col gap-2">
#                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
#                                <div className="relative"><select
# ...
#                            </div>
# )}
# And change it to:
# {!subjectContext && (
# ...
# )}

# But wait, looking at the grep output:
# 350:                                <label className="text-[13px] font-medium text-themeTextSec">Target Batch</label>
# It seems it was partially inside `{( ... )}` already?
# Let's see the context around line 348.
