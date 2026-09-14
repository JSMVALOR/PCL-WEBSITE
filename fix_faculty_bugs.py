import os

base_path = '/Users/JSM/Developer/PRUDENTIA COLLEGE OF LAW/PCL WEBSITE V6/src/ERP/components/Faculty/'

# 1. FacultyAttendance.jsx
file_path = os.path.join(base_path, 'FacultyAttendance/FacultyAttendance.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'const [isSaving, setIsSaving]' not in content:
    content = content.replace('const [searchQuery, setSearchQuery] = useState("");', 'const [searchQuery, setSearchQuery] = useState("");\n  const [isSaving, setIsSaving] = useState(false);')
    with open(file_path, 'w') as f:
        f.write(content)


# 2. FacultyStudentProfile360.jsx
file_path = os.path.join(base_path, 'FacultyMentorship/FacultyStudentProfile360.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'import { Badge }' not in content:
    content = content.replace('import { GlassSurface }', 'import { Badge } from "../../ui/Badge";\nimport { GlassSurface }')
    with open(file_path, 'w') as f:
        f.write(content)

# 3. FacultyMentorship.jsx
file_path = os.path.join(base_path, 'FacultyMentorship/FacultyMentorship.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'const handleReportGrievance' not in content:
    content = content.replace('const handleIssueWarning', '''const handleReportGrievance = (e) => { e.preventDefault(); };
  const handleGrievanceAction = (id, action, note) => {};
  const handleIssueWarning''')
    with open(file_path, 'w') as f:
        f.write(content)

# 4. FacultyMarks.jsx
file_path = os.path.join(base_path, 'FacultyMarks/FacultyMarks.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'const activeSubjectObj = subjectContext' not in content:
    content = content.replace('const handleSyncToLMS = async () => {', 'const handleSyncToLMS = async () => {\n    const activeSubjectObj = subjectContext;')
    with open(file_path, 'w') as f:
        f.write(content)

# 5. FacultyLeave.jsx
file_path = os.path.join(base_path, 'FacultyLeave/FacultyLeave.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'setShowRequestModal(true)' not in content:
    content = content.replace('<PageHeader', '<PageHeader rightContent={<button onClick={() => setShowRequestModal(true)} className="px-4 py-2 bg-themeAccent text-white rounded-lg hover:bg-themeAccent/90 transition-colors">Apply for Leave</button>} ')
    with open(file_path, 'w') as f:
        f.write(content)

print("Faculty fixes applied.")
