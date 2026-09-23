with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'r') as f:
    content = f.read()

content = content.replace(" {(\n                            <div className=\"flex flex-col gap-2\">\n                                <label className=\"text-[13px] font-medium text-themeTextSec\">Target Batch</label>", " {!subjectContext && (\n                            <div className=\"flex flex-col gap-2\">\n                                <label className=\"text-[13px] font-medium text-themeTextSec\">Target Batch</label>")

with open('src/ERP/components/Faculty/FacultyMarks/FacultyMarks.jsx', 'w') as f:
    f.write(content)
