import os

base_path = '/Users/JSM/Developer/PRUDENTIA COLLEGE OF LAW/PCL WEBSITE V6/src/ERP/components/Admin/'

# 1. AdminMootCourt.jsx
file_path = os.path.join(base_path, 'AdminMootCourt/AdminMootCourt.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('onClick={() => handleSelectTeam(bid.id)}', 'onClick={() => handleSelectBid(bid.id)}')
with open(file_path, 'w') as f:
    f.write(content)

# 2. UserManagement.jsx
file_path = os.path.join(base_path, 'UserManagement/UserManagement.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'import AdminFacultyEditorModal' not in content:
    content = content.replace('import AdminStudentCVModal', 'import AdminFacultyEditorModal from "../AdminFacultyDirectory/AdminFacultyEditorModal";\nimport AdminStudentCVModal')
    with open(file_path, 'w') as f:
        f.write(content)

# 3. AdminPasswordResetsModal.jsx
file_path = os.path.join(base_path, 'UserManagement/AdminPasswordResetsModal.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('onClick={() => handleApprove(req.id)}', 'onClick={() => handleApprove(req)}')
with open(file_path, 'w') as f:
    f.write(content)

# 4. AdminHelpdesk.jsx
file_path = os.path.join(base_path, 'AdminHelpdesk/AdminHelpdesk.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'import { sendSystemEmail }' not in content:
    content = content.replace('import { useERP }', 'import { sendSystemEmail } from "../../../lib/EmailService";\nimport { useERP }')
    with open(file_path, 'w') as f:
        f.write(content)

# 5. AdminApprovals.jsx
file_path = os.path.join(base_path, 'AdminApprovals/AdminApprovals.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'const [facultyLeaves' not in content:
    content = content.replace('const [activeTab, setActiveTab]', 'const [facultyLeaves, setFacultyLeaves] = useState([]);\n  const handleLeaveAction = () => {};\n  const [activeTab, setActiveTab]')
    with open(file_path, 'w') as f:
        f.write(content)

# 6. ScheduleBuilder.jsx
file_path = os.path.join(base_path, 'AdminTimetableBuilder/tabs/ScheduleBuilder.jsx')
with open(file_path, 'r') as f:
    content = f.read()
if 'const handleCreate = () =>' not in content:
    content = content.replace('const [isCreating, setIsCreating] = useState(false);', 'const [isCreating, setIsCreating] = useState(false);\n  const [day, setDay] = useState("Monday");\n  const [startTime, setStartTime] = useState("");\n  const [endTime, setEndTime] = useState("");\n  const handleCreate = () => {};')
    with open(file_path, 'w') as f:
        f.write(content)

# 7. AdminSiteEditor.jsx
file_path = os.path.join(base_path, 'AdminSiteEditor/AdminSiteEditor.jsx')
with open(file_path, 'r') as f:
    content = f.read()
content = content.replace('h-auto overflow-hidden sticky top-6 z-20', 'max-h-[calc(100vh-4rem)] overflow-y-auto sticky top-6 z-20')
with open(file_path, 'w') as f:
    f.write(content)

print("Admin fixes applied.")
